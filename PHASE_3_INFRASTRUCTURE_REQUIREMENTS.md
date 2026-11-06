# Janmabhoomi Digital Newspaper – Phase 3: Infrastructure Requirements & Hosting Strategy

**Document Version:** 1.0.0  
**Context:** Saurashtra Trust currently maintains a Hostinger server environment and a PayU merchant account.  
**Objective:** Define precise infrastructure specifications, evaluate Hostinger VPS capabilities vs Managed Cloud, and establish backup/disaster recovery protocols.

---

## 1. Hosting Architecture Comparison: Hostinger VPS vs Cloud

| Evaluation Criteria | Hostinger VPS (KVM 4 or KVM 8) | Managed Cloud (Hetzner / DigitalOcean) | Enterprise Cloud (AWS / GCP) |
| :--- | :--- | :--- | :--- |
| **Suitability for Phase 3** | **Acceptable for Backend API & DB** | **Recommended for Production** | Overkill for Initial Launch |
| **Typical Monthly Cost** | ₹1,500 – ₹3,500 / month | ₹2,500 – ₹5,000 / month | ₹15,000 – ₹35,000+ / month |
| **vCPU & RAM Specs** | 4 to 8 vCPU, 16GB – 32GB RAM | 4 to 8 dedicated vCPU, 16GB RAM | Variable / Pay-as-you-go |
| **Storage Technology** | NVMe SSD (100GB – 400GB) | NVMe SSD with Block Storage | EBS (gp3) + S3 |
| **Automated DB Backups** | Basic snapshot only | Daily managed snapshots | Automated Point-in-time recovery |
| **Managed DB / Redis** | Self-hosted inside Docker | Managed DB optional | Fully managed RDS + ElastiCache |
| **Bandwidth Limits** | 4TB – 8TB / month | 20TB / month | Billed per GB egress (expensive) |

### Recommended Infrastructure Strategy for Saurashtra Trust:
1. **Frontend Layer (Next.js):** Deploy to **Vercel Pro / Enterprise** or Cloudflare Pages. This completely offloads global CDN caching, SSL certificates, Next.js image optimization, and DDoS defense from Saurashtra Trust's origin server.
2. **Backend API, CMS & Worker Layer:** Deploy as Docker containers on **Hostinger KVM 4/8 VPS** (or equivalent Dedicated VPS).
3. **Storage Layer (PDFs & High-Res Pages):** Do **NOT** store high-resolution PDFs directly on the VPS disk. Use **Cloudflare R2** or AWS S3 (S3-compatible, zero egress fees with Cloudflare R2, preventing disk saturation).

---

## 2. Hardware & Resource Specifications

### 2.1 Stage 1: Production Launch Specification (Hostinger VPS)
- **vCPU:** Minimum 4 vCPU (KVM 4) or 8 vCPU (KVM 8)
- **Memory (RAM):** 16 GB ECC RAM
  - *RAM Allocation:* PostgreSQL (4GB), Redis (2GB), Node.js API (2GB), PDF Slicing Worker (4GB), OS & Buffers (4GB).
- **Disk Storage:** 200 GB NVMe SSD (RAID 10)
- **Operating System:** Ubuntu 24.04 LTS (64-bit)
- **Container Engine:** Docker Engine 26+ with Docker Compose v2

### 2.2 Stage 2: High-Traffic Scaling (Over 50,000 Concurrent Readers)
- Segregate the PostgreSQL database onto a dedicated database instance.
- Add an asynchronous PostgreSQL Read Replica for heavy news search and archives.
- Scale Node.js API containers behind an NGINX or Traefik load balancer.

---

## 3. Object Storage Specification (S3-Compatible)

Pre-press PDF editions (each 150MB to 250MB) and multi-resolution 300 DPI WebP page renderings generate approximately **30GB to 50GB of new assets per year per publication**. Across 6 publications, this equals **~250GB to 300GB annually**.

### Recommended Storage: Cloudflare R2
- **Protocol:** 100% S3-compatible API (uses standard AWS SDK `@aws-sdk/client-s3`).
- **Cost Advantage:** **Zero egress bandwidth fees** (saving tens of thousands of rupees compared to standard AWS S3 bandwidth).
- **Security:** Private bucket with Pre-Signed URL support for time-limited subscriber access.

---

## 4. Domain, DNS & SSL Configuration

```
janmabhoomi.in (Apex Domain)       ---> Cloudflare CNAME ---> Vercel (Next.js Frontend)
www.janmabhoomi.in                 ---> Cloudflare CNAME ---> Vercel (Next.js Frontend)
api.janmabhoomi.in                 ---> Cloudflare A Record ---> Hostinger VPS (Node.js API)
admin.janmabhoomi.in               ---> Cloudflare CNAME / A ---> Staff CMS Interface
assets.janmabhoomi.in              ---> Cloudflare R2 Custom Domain (Edge Cached Assets)
```

- **SSL Certificates:** Universal TLS 1.3 via Cloudflare with Strict SSL mode enabled between Cloudflare and Hostinger VPS (using Cloudflare Origin CA certificates).

---

## 5. Automated Backups & Disaster Recovery (DR)

### 5.1 Recovery Objectives
- **Recovery Point Objective (RPO):** Maximum **1 hour** of editorial data loss in catastrophe.
- **Recovery Time Objective (RTO):** Full system restoration within **4 hours**.

### 5.2 Backup Protocol
1. **Database Dumps:** Automated `pg_dump` executed every 6 hours via an isolated cron container.
2. **Offsite Replication:** Encrypted dumps (`gpg` encrypted with AES-256) are immediately synced to an external secondary cloud bucket (separate from the Hostinger provider).
3. **Retention Policy:**
   - Hourly dumps retained for 7 days.
   - Daily dumps retained for 30 days.
   - Monthly historical archives retained indefinitely.
4. **Disaster Recovery Drill:** Quarterly restoration test on a staging server to verify dump file integrity.
