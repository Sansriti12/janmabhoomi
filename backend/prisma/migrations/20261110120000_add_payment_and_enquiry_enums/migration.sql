-- ============================================================================
-- Migration: 20261110120000_add_payment_and_enquiry_enums
-- Description: Adds enum values for PaymentStatus, and creates new enums
--              for Subscribers, Payments, Orders, and Enquiries.
--              Commits before subsequent migrations reference them.
-- ============================================================================

-- 1. Create New Enums
CREATE TYPE "SubscriberStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'UNVERIFIED');
CREATE TYPE "PaymentSource" AS ENUM ('WEBSITE', 'ANDROID_APP', 'IOS_APP', 'MANUAL_ADMIN');
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'ATTEMPTED', 'PAID', 'FAILED');
CREATE TYPE "EnquiryStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESEARCHING', 'CONTACTED', 'COMPLETED', 'REJECTED');

-- 2. Update PaymentStatus Enum for Razorpay (AUTHORIZED, CAPTURED)
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'AUTHORIZED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CAPTURED';
