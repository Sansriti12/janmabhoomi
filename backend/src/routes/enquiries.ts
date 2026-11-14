import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";

// Zod schema for public archive enquiry submission
const archiveEnquirySchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(150, "Full name cannot exceed 150 characters"),
  contactNumber: z
    .string({ required_error: "Contact number is required" })
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .email("Please enter a valid email address")
    .max(255),
  publication: z
    .string({ required_error: "Publication is required" })
    .min(1, "Publication selection is required"),
  year: z
    .number({ required_error: "Year of archive is required" })
    .int("Year must be an integer")
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  infoType: z
    .string({ required_error: "Type of information is required" })
    .min(1, "Type of information is required"),
  additionalDetails: z
    .string()
    .trim()
    .max(2000, "Additional details cannot exceed 2000 characters")
    .optional(),
  preferredContact: z
    .enum(["phone", "email", "either"])
    .default("either"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the contact consent before submitting." }),
  }),
});

// Helper function to generate standardized reference number: AR-YYYY-XXXX
function generateReferenceNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AR-${currentYear}-${randomSuffix}`;
}

export const enquiriesRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * POST /api/v1/enquiries/archive
   * Public submission of archived newspaper information enquiry.
   */
  app.post("/archive", async (request, reply) => {
    // 1. Validate payload with Zod
    const validationResult = archiveEnquirySchema.safeParse(request.body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((e) => e.message);
      reply.status(400);
      return {
        success: false,
        error: errorMessages[0],
        details: errorMessages,
      };
    }

    const data = validationResult.data;

    // 2. Check Database Connectivity
    if (!app.prisma) {
      reply.status(503);
      return {
        success: false,
        error:
          "Database service is currently offline. Please contact the Saurashtra Trust Archive Section directly at Janmabhoomi Bhavan, Fort, Mumbai (Email: archives@janmabhoomi.in).",
      };
    }

    // Canonical publication ID resolver (accepts both slug and canonical id)
    const pubMap: Record<string, string> = {
      "janmabhoomi": "pub-janmabhoomi",
      "kutchmitra": "pub-kutchmitra",
      "phulchhab": "pub-phulchhab",
      "vyapar-gujarati": "pub-vyapar-gu",
      "vyapar-hindi": "pub-vyapar-hi",
      "janmabhoomi-pravasi": "pub-pravasi",
      "panchang": "pub-panchang",
      "kavita": "pub-kavita",
    };
    const targetPublicationId = pubMap[data.publication] || data.publication;

    try {
      // 3. Duplicate Prevention: Check if same contact submitted identical enquiry in last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const duplicate = await app.prisma.archiveEnquiry.findFirst({
        where: {
          contactNumber: data.contactNumber,
          publicationId: targetPublicationId,
          yearRequested: data.year,
          createdAt: {
            gte: fifteenMinutesAgo,
          },
        },
      });

      if (duplicate) {
        reply.status(409);
        return {
          success: false,
          error:
            "A duplicate enquiry for this publication and year was already submitted recently. Our archive team is processing your existing request.",
          referenceNumber: duplicate.referenceNumber,
        };
      }

      // 4. Concurrency-Safe Unique Reference Generation & Database Insertion
      let savedEnquiry = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (!savedEnquiry && attempts < maxAttempts) {
        attempts++;
        const referenceNumber = generateReferenceNumber();

        try {
          savedEnquiry = await app.prisma.archiveEnquiry.create({
            data: {
              referenceNumber,
              fullName: data.fullName,
              contactNumber: data.contactNumber,
              email: data.email,
              publicationId: targetPublicationId,
              yearRequested: data.year,
              infoType: data.infoType,
              additionalDetails: data.additionalDetails || null,
              preferredContact: data.preferredContact,
              consentGiven: data.consent,
              status: "PENDING",
            },
          });
        } catch (err: unknown) {
          // Check for Prisma unique constraint violation code P2002
          const isUniqueConstraintViolation =
            typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";

          if (isUniqueConstraintViolation && attempts < maxAttempts) {
            app.log.warn(`Reference number collision on ${referenceNumber}, retrying (${attempts}/${maxAttempts})...`);
            continue;
          }
          throw err;
        }
      }

      if (!savedEnquiry) {
        throw new Error("Failed to allocate a unique reference number after multiple attempts.");
      }

      app.log.info(
        `Archive enquiry successfully stored: ${savedEnquiry.referenceNumber} for ${savedEnquiry.fullName}`
      );

      // 6. Return confirmed response ONLY after successful DB storage
      reply.status(201);
      return {
        success: true,
        referenceNumber: savedEnquiry.referenceNumber,
        message:
          "Your archived information enquiry has been recorded in our permanent register. Our archive team will review the availability and contact you.",
        createdAt: savedEnquiry.createdAt.toISOString(),
      };
    } catch (err: unknown) {
      app.log.error(err, "Error storing archive enquiry in database");

      const errorMessage =
        err instanceof Error ? err.message : "Failed to store enquiry";

      reply.status(500);
      return {
        success: false,
        error:
          "Database transaction could not be completed. Please reach out to archives@janmabhoomi.in or try again shortly.",
        diagnostic:
          app.log.level === "debug" || process.env.NODE_ENV !== "production"
            ? errorMessage
            : undefined,
      };
    }
  });

  /**
   * POST /api/v1/enquiries/contact
   * General contact message submission.
   */
  app.post("/contact", async (request, reply) => {
    const contactSchema = z.object({
      fullName: z.string().trim().min(3).max(150),
      email: z.string().trim().email().max(255),
      mobileNumber: z.string().trim().regex(/^[6-9]\d{9}$/).optional(),
      subject: z.string().trim().min(3).max(255),
      message: z.string().trim().min(10).max(5000),
    });

    const parsed = contactSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400);
      return { success: false, error: parsed.error.errors[0].message };
    }

    try {
      const contact = await app.prisma.contactEnquiry.create({
        data: {
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          mobileNumber: parsed.data.mobileNumber || null,
          subject: parsed.data.subject,
          message: parsed.data.message,
          status: "PENDING",
        },
      });

      reply.status(201);
      return {
        success: true,
        message: "Thank you for contacting Janmabhoomi Group. Your message has been received.",
        id: contact.id,
      };
    } catch (err: unknown) {
      app.log.error(err, "Failed to save contact enquiry");
      reply.status(500);
      return { success: false, error: "Failed to submit contact message to database." };
    }
  });
};

export default enquiriesRoutes;
