# Janmabhoomi Digital Newspaper – Phase 3: Open Questions for Executive Management

**Document Version:** 1.0.0  
**Target Stakeholders:** Board of Trustees, General Manager, Chief Editor, Systems Administrator  
**Organization:** Saurashtra Trust (Janmabhoomi Group of Newspapers)

---

To ensure a seamless transition from the current verified frontend into Phase 3 backend implementation, management guidance is requested on the following strategic and operational items:

---

### Category 1: Hostinger Server Environment & Access
1. **Server Type & Specifications:**
   - What is the exact plan of the existing Hostinger server (e.g., Shared cPanel Hosting, Cloud Startup, or KVM Virtual Private Server)?
   - *Requirement:* The backend API, PostgreSQL database, and background PDF processing workers require **Ubuntu Linux KVM VPS with root SSH access**. Shared hosting (cPanel/PHP-only) cannot run Node.js microservices, Docker, or Ghostscript rasterization.
2. **Resource Allocation:**
   - If a VPS is already active, what are its current RAM (e.g., 8GB/16GB) and NVMe disk capacities?
3. **Dedicated IP Address:**
   - Does the server have a dedicated static IPv4 address suitable for binding PayU server webhook allowlists?

---

### Category 2: Domain Names, DNS & SSL Governance
1. **DNS Provider Control:**
   - Where are the DNS records for `janmabhoomi.in` currently managed (e.g., Hostinger DNS, GoDaddy, Cloudflare)?
   - *Recommendation:* Management should authorize pointing nameservers to Cloudflare. This enables zero-cost DDoS protection, edge caching, and free universal SSL.
2. **Subdomain Scheme Approval:**
   - Can management confirm the proposed subdomain allocations:
     - `janmabhoomi.in` & `www.janmabhoomi.in` -> Public Next.js Digital Portal
     - `api.janmabhoomi.in` -> Core Backend REST API
     - `admin.janmabhoomi.in` -> Editorial CMS Newsroom
     - `assets.janmabhoomi.in` -> Media & E-Paper Cloud Storage

---

### Category 3: PayU India Merchant Account Configuration
1. **Integration Credentials:**
   - Can the accounting/technical team provide the **PayU Merchant Key** and **Merchant Salt** for both the **Test/Sandbox** environment and the **Production** environment?
2. **Checkout Flow Selection:**
   - Does the current PayU contract support standard **Hosted Checkout** (PayU payment page redirect) or **Seamless Checkout**? (Hosted Checkout is strongly recommended as it eliminates PCI-DSS compliance burdens for Saurashtra Trust).
3. **Settlement & Auto-Refunds:**
   - Is the PayU account enabled for automated webhooks and refund issuance via API?
4. **GST & Invoicing Requirements:**
   - Does Saurashtra Trust require automated 18% GST invoice PDF generation with the Trust's GSTIN and state tax breakup for digital subscribers?

---

### Category 4: Pre-Press E-Paper Production Workflow
1. **Nightly PDF Delivery Timing:**
   - At what time during the night are the final pre-press print PDFs ready from the printing press (e.g., 1:00 AM, 2:30 AM, or 4:00 AM IST)?
2. **PDF File Structure & Source Software:**
   - Are the print pages exported as a single combined PDF (e.g., 16 pages together) or as individual single-page PDFs from Adobe InDesign / QuarkXPress?
3. **Target Edition Editions:**
   - Which specific city editions should be active on Day 1 (e.g., Janmabhoomi Mumbai Edition, Janmabhoomi Rajkot Edition)?
4. **Editorial Staff for Hotspots:**
   - Will Saurashtra Trust designate 1-2 desk operators to draw article hotspots on the E-Paper, or should editions be published with full-page zoom initially?

---

### Category 5: Subscription Commercial Packaging & Pricing
1. **Final Price Approvals:**
   - Please review and formally approve the proposed subscription tiers:
     - Janmabhoomi E-Paper Monthly: **₹75 / month**
     - Janmabhoomi E-Paper Annual: **₹600 / year** (Discounted from ₹900)
     - Saurashtra Trust All-Access Annual (All 6 Publications): **₹1,200 / year**
2. **Free Teaser Policy:**
   - Does management approve the policy of keeping **Page 1 and Page 2 free for all readers**, with the paywall locking Pages 3 through 16?
3. **Promotional Offers & Trial Passes:**
   - Should the system support 7-day free trial passes or discount coupon codes (e.g., `DIWALI2026`) at checkout?

---

### Category 6: Multi-Publication Rollout Strategy
1. **Order of Activation:**
   - Is *Janmabhoomi* the primary publication to launch first, followed by *Vyapar* and *Phulchhab*, or should all mastheads launch concurrently?
2. **Specialized Financial Data for *Vyapar*:**
   - For *Vyapar* (financial daily), will automated market rates (gold/silver bullion, commodity mandi rates, Sensex) be provided via live CSV/API feeds, or manually entered by editors?

---

### Category 7: Legacy Content & Historical Archives
1. **Digitization Backlog:**
   - Is there a backlog of historical digitized articles or older PDF editions (e.g., from 2020–2025) that must be migrated into the new PostgreSQL database, or does digital archiving begin from launch date?
