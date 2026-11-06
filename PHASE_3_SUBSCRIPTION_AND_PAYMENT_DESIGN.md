# Janmabhoomi Digital Newspaper – Phase 3: Subscription & Payment Design

**Document Version:** 1.0.0  
**Payment Gateway:** PayU India (Hosted Checkout & S2S Webhooks)  
**Currency:** Indian Rupee (INR - ₹)  
**Target Entities:** Saurashtra Trust Publications (Janmabhoomi, Vyapar, Phulchhab, Kutchmitra)

---

## 1. PayU Integration Architecture & Payment Lifecycle

Payment security in the Janmabhoomi digital platform is designed with **zero client trust**: the browser never calculates transaction hashes, never handles raw card or UPI credentials, and cannot self-certify payment success.

```
+-----------------------------------------------------------------------------------+
| 1. CHECKOUT INITIATION (BROWSER)                                                  |
|    User selects "Janmabhoomi E-Paper Annual Plan" (₹600)                          |
|    Clicks "Subscribe Now" -> POST /api/v1/subscriptions/initiate                  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. BACKEND HASH GENERATION & ORDER CREATION                                       |
|    - Verify user authentication and plan validity in DB                           |
|    - Generate unique internal reference: `JNB-PAY-20261105-9821`                 |
|    - Create record in `payment_transactions` (status: 'initiated')                 |
|    - Compute SHA-512 Request Hash using secret PayU Merchant Salt:                 |
|      hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1..udf5|salt)  |
|    - Return secured payload to frontend                                           |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. SECURE PAYU HOSTED REDIRECT / MODAL                                            |
|    Frontend submits autosubmitting form to PayU Hosted Checkout URL               |
|    (https://secure.payu.in/_payment)                                              |
|    User completes payment via UPI (GPay/PhonePe), NetBanking, Credit/Debit Card    |
+-----------------------------------------------------------------------------------+
                                          |
                                          +-----------------------------------------+
                                          |                                         |
                                          v (Sync Redirect)                         v (Async S2S)
+----------------------------------------------------+   +------------------------------------+
| 4. CLIENT RETURN REDIRECT                          |   | 5. SERVER-TO-SERVER WEBHOOK        |
|    Browser redirected to /payment/callback         |   |    PayU posts raw payload to:      |
|    Shows "Payment Processing, verifying with bank" |   |    POST /api/v1/payments/webhook   |
|    Polls backend transaction status                |   |    (Instant, reliable notification)|
+----------------------------------------------------+   +------------------------------------+
                                                                            |
                                                                            v
+-----------------------------------------------------------------------------------+
| 6. CRYPTOGRAPHIC VERIFICATION & IDEMPOTENT ENTITLEMENT                            |
|    - Backend computes reverse SHA-512 hash:                                       |
|      expectedHash = sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|...    |
|                             firstname|productinfo|amount|txnid|key)               |
|    - If hash mismatch -> Flag FRAUD, log incident, reject transaction             |
|    - If hash matches & status == 'success':                                       |
|      * Acquire Redis distributed lock on `txnid` (prevents double activation)    |
|      * Check if transaction already processed (idempotency check)                 |
|      * Update `payment_transactions` status = 'success'                           |
|      * Insert or extend record in `user_subscriptions` (starts_at, expires_at)    |
|      * Invalidate cached user entitlement in Redis                                |
|      * Dispatch confirmation email & SMS receipt to subscriber                    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Cryptographic Hash Calculation Specifications

PayU India requires strict SHA-512 hashing to guarantee payload integrity.

### 2.1 Outbound Request Hash Formula
```
sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
```

### 2.2 Inbound Response / Webhook Reverse Hash Formula
```
sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
```
*Note: If the transaction includes additional charges (convenience fee), the formula prepends `additionalCharges|SALT|...` in accordance with PayU protocols.*

---

## 3. Subscription Commercial Packaging

The subscription plans are structured to encourage long-term annual commitments while offering accessible short-term passes:

| Plan Code | Publication Scope | Duration | Price (INR) | Features & Privileges |
| :--- | :--- | :--- | :--- | :--- |
| `JNB-EPAPER-M` | Janmabhoomi | 30 Days | ₹75 | All Mumbai editions, 30-day archive, 2 devices |
| `JNB-EPAPER-A` | Janmabhoomi | 365 Days | ₹600 | All Mumbai editions, 365-day archive, offline PDF clipping, 2 devices |
| `ST-ALL-ACCESS-A` | All Trust Papers (6 mastheads)| 365 Days | ₹1,200 | Janmabhoomi + Vyapar + Phulchhab + Kutchmitra + Pravasi + Kavita, priority support |
| `VYAPAR-COMM-A` | Vyapar (Financial) | 365 Days | ₹750 | Complete market bullion, commodity & equity daily reports |

---

## 4. Idempotency, Failure Modes & Webhook Resilience

### 4.1 Webhook Retry Handling
- PayU webhooks may retry multiple times if network timeouts occur.
- **Idempotency Guard:** The backend wraps transaction updates in a PostgreSQL serializable transaction and uses a Redis lock `lock:payment:txnid`. If the transaction status is already marked `success`, the webhook returns HTTP 200 immediately without extending subscription validity twice.

### 4.2 Handling Abandoned or Failed Transactions
- If a user closes the PayU browser window without completing payment, the transaction status remains `initiated`.
- A scheduled cron worker (`CheckPendingPayUOrdersJob`) runs every 30 minutes, querying PayU's Server Verification API (`verify_payment`) for all `initiated` transactions older than 20 minutes to retrieve the definitive status from PayU's core banking network.

### 4.3 Plan Renewal & Expiry State Machine
```
[ ACTIVE SUBSCRIPTION ]
         |
         v (T - 7 Days)
[ RENEWAL REMINDER (Email / SMS) ]
         |
         v (T = Expiry Date)
[ GRACE PERIOD (48 Hours, Access Maintained) ]
         |
         +---------------------------------------+
         |                                       |
         v (Payment Received)                    v (No Payment)
[ EXTENDED ACTIVE ]                     [ EXPIRED (Paywall Activated) ]
```

---

## 5. Anti-Account Sharing & Concurrent Session Control

To prevent unauthorized sharing of single subscriber logins across commercial offices or WhatsApp groups:

1. **Maximum Concurrent Devices:** Each subscriber account is strictly limited to **2 active sessions** (e.g., 1 mobile phone and 1 desktop/laptop).
2. **Session Fingerprinting:** When logging in, the server generates a cryptographically signed device fingerprint token stored in Redis:
   `session:{userId}:{deviceId}`
3. **Graceful Eviction:** When a third device attempts to sign in:
   - The user is notified: *"You have reached your 2-device limit. Would you like to log out of your previous device (Chrome on Windows - Mumbai)?"*
   - Upon confirmation, the oldest session token is revoked in Redis, instantly logging out the previous device.
4. **IP Velocity Anomaly Detection:** If an active subscriber session is used concurrently from two geographic locations over 200km apart within 10 minutes (e.g., simultaneous reads from Mumbai and London), access is temporarily gated with an SMS OTP verification challenge.
