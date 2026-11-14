# JANMABHOOMI DIGITAL NEWSPAPER PLATFORM
## OFFICIAL RAZORPAY INTEGRATION & SETUP GUIDE

This guide provides step-by-step instructions for configuring Razorpay for the Janmabhoomi digital newspaper platform across Development, Staging, and Production environments (Hostinger KVM VPS).

---

### 1. Generating Razorpay API Keys

#### Test Mode (Development & Staging)
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. In the top-right corner, toggle the environment switch from **Live** to **Test Mode**.
3. Navigate to **Settings** > **API Keys** in the left sidebar.
4. Click **Generate Test Key**.
5. Copy both the **Key Id** (`rzp_test_...`) and the **Key Secret**.
6. Store them securely. The Key Secret cannot be viewed again once the modal is closed.

#### Live Mode (Production on Hostinger VPS)
1. Ensure your Razorpay account activation and KYC verification are complete.
2. In the top-right corner, switch to **Live Mode**.
3. Navigate to **Settings** > **API Keys**.
4. Click **Generate Live Key**.
5. Copy both the **Key Id** (`rzp_live_...`) and the **Key Secret**.

---

### 2. Environment Variables Configuration

#### Backend Configuration (`backend/.env`)
Set the following environment variables in the Fastify backend:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpaySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
RAZORPAY_MODE=test

# CORS & Base URLs
CORS_ORIGIN=http://localhost:3000,https://janmabhoomi.in
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Frontend Configuration (`.env.local` or environment)
In the Next.js frontend, expose **only** the public Key ID:

```env
# ONLY the public key ID is exposed to the browser
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
```

> [!CAUTION]
> **NEVER expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in frontend code, git commits, or Next.js public variables.** All signature verification and order creation must occur strictly on the Fastify backend.

---

### 3. Webhook Configuration in Razorpay Dashboard

Webhooks ensure that if a user closes their browser before returning to the website, the subscription is still activated immediately upon payment capture.

1. Navigate to **Settings** > **Webhooks** in the Razorpay Dashboard.
2. Click **+ Add New Webhook**.
3. **Webhook URL**:
   - For local development: Use ngrok or Cloudflare Tunnel (e.g. `https://your-tunnel.ngrok-free.app/api/v1/payments/webhook`).
   - For production: `https://api.janmabhoomi.in/api/v1/payments/webhook` (or `https://janmabhoomi.in/api/v1/payments/webhook`).
4. **Secret**: Enter a strong random secret string (at least 32 characters). Copy this value into `RAZORPAY_WEBHOOK_SECRET` in `backend/.env`.
5. **Active Events**: Select the following required events:
   - `payment.captured` (Primary event: payment captured successfully)
   - `order.paid` (Secondary event: order marked fully paid)
   - `payment.failed` (Auditing event: user payment attempt failed)
   - `refund.processed` (Subscription cancellation / refund event)
6. Click **Save Webhook**.

---

### 4. Testing Webhook Delivery with Razorpay Simulator

1. On the **Webhooks** page in the Razorpay Dashboard, find your configured webhook.
2. Click **Send Test Event**.
3. Select `payment.captured`.
4. Ensure the test payload contains an existing `order_id`.
5. Click **Send**.
6. Check the Fastify backend logs to confirm:
   - Status 200 returned.
   - Event logged in `razorpay_webhook_logs` table.
   - Subscription activated for the subscriber.

---

### 5. Secret Rotation Without Downtime

If a key or webhook secret is compromised:
1. In the Razorpay Dashboard under **Settings > API Keys**, click **Regenerate Key**.
2. Select **Deactivate old key in 24 hours** (or preferred grace period).
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`.
4. Restart the Fastify backend process (`pm2 reload janmabhoomi-backend`).
5. After confirming the new key works, deactivate the old key in the Razorpay Dashboard.

---

### 6. Production Deployment Checklist (Hostinger KVM VPS)

Before toggling from test mode to live mode:
- [ ] Account activation & bank account verification completed with Razorpay.
- [ ] Valid SSL certificate (HTTPS) installed and active on production domain.
- [ ] Production webhook endpoint registered with `https://` protocol.
- [ ] Webhook secret configured and verified with live test ping.
- [ ] `RAZORPAY_MODE=live` configured in backend environment.
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...` configured in frontend build.
- [ ] `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` kept private on VPS.
- [ ] Real transaction test conducted (e.g. ₹1.00 test tier or minimum price) and refund verified.
- [ ] Fastify CORS restricted to institutional production domains (`https://janmabhoomi.in`, `https://admin.janmabhoomi.in`).
