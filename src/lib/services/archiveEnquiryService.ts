/**
 * Centralized Archive Enquiry Service Layer
 * 
 * Provides a clean interface between the frontend enquiry form and the Fastify backend API.
 * Currently configured to detect if the central backend endpoint is ready/reachable.
 * When the backend is offline or pending integration, returns a clear status
 * indicating online submission is undergoing backend connection, rather than
 * simulating mock storage.
 */

export interface ArchiveEnquiryPayload {
  fullName: string;
  contactNumber: string;
  email: string;
  publication: string;
  year: number;
  infoType: string;
  additionalDetails?: string;
  preferredContact: "phone" | "email" | "either";
  consent: boolean;
}

export interface ArchiveEnquirySubmitResult {
  success: boolean;
  referenceNumber?: string;
  message?: string;
  error?: string;
  backendPending?: boolean;
}

export async function submitArchiveEnquiry(
  payload: ArchiveEnquiryPayload
): Promise<ArchiveEnquirySubmitResult> {
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // When backend API base URL is not yet connected in environment
  if (!backendBaseUrl) {
    return {
      success: false,
      backendPending: true,
      error:
        "Online archive enquiry submission is undergoing central backend integration. Please reach out to the Saurashtra Trust Archive Section directly at Janmabhoomi Bhavan, Fort, Mumbai (Email: archives@janmabhoomi.in).",
    };
  }

  try {
    const res = await fetch(`${backendBaseUrl}/api/v1/enquiries/archive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data.success && data.referenceNumber) {
      return {
        success: true,
        referenceNumber: data.referenceNumber,
        message: data.message,
      };
    }

    return {
      success: false,
      error: data.error || data.message || "Failed to submit enquiry to server.",
    };
  } catch {
    return {
      success: false,
      backendPending: true,
      error:
        "The central backend service is currently unreachable. Online enquiry submission is undergoing backend integration. Please contact Janmabhoomi Bhavan directly.",
    };
  }
}
