import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { FastifyRequest, FastifyReply } from "fastify";

/**
 * STRICT SCOPE: Only these TWO newspaper publications are managed in the Janmabhoomi Admin Panel:
 * 1. pub-janmabhoomi: Janmabhoomi (Daily Evening Broadsheet Newspaper, est. 9 June 1934)
 * 2. pub-pravasi: Janmabhoomi Pravasi (Sunday Weekly Family Edition Newspaper, est. 22 Oct 1939)
 *
 * NOTE: Purti (પૂર્તિ) is NOT an independent publication or newspaper record.
 * In the Janmabhoomi ecosystem, Purti refers to special magazine-style supplements
 * (e.g., Madhuvan, Meghdhanush, Madhurima) bundled with newspaper editions.
 *
 * All other publications (Kutchmitra, Phulchhab, Vyapar Gujarati, Vyapar Hindi, Panchang, Kavita)
 * have their own dedicated portals and must NEVER be accessible via Janmabhoomi admin APIs.
 */
export const PERMITTED_PUBLICATION_IDS = [
  "pub-janmabhoomi",
  "pub-pravasi",
] as const;

export type PermittedPublicationId = (typeof PERMITTED_PUBLICATION_IDS)[number];

export function isPermittedPublicationId(id: string): id is PermittedPublicationId {
  return (PERMITTED_PUBLICATION_IDS as readonly string[]).includes(id);
}

export type UnifiedStaffRole = "Admin" | "Editor";

/**
 * Maps existing database roles into the unified Admin Panel roles: "Admin" or "Editor".
 * Preserves legacy DB role IDs while presenting a simplified 2-role system in Phase 5A.
 */
export function resolveUnifiedRole(roleIds: string[]): UnifiedStaffRole | null {
  if (roleIds.includes("super_admin") || roleIds.includes("administrator")) {
    return "Admin";
  }
  if (
    roleIds.includes("editor") ||
    roleIds.includes("chief_editor") ||
    roleIds.includes("epaper_manager") ||
    roleIds.includes("reporter")
  ) {
    return "Editor";
  }
  return null;
}

export interface AuthenticatedStaffUser {
  id: string;
  email: string;
  fullName: string;
  isStaff: boolean;
  status: string;
  unifiedRole: UnifiedStaffRole;
  dbRoles: string[];
}

declare module "fastify" {
  interface FastifyRequest {
    staffUser?: AuthenticatedStaffUser;
    unifiedRole?: UnifiedStaffRole;
  }
}

/**
 * Hashes a plaintext bearer token with SHA-256 for persistent database storage.
 */
export function hashStaffToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a persistent 24-hour staff session and returns the plaintext session token.
 */
export async function createStaffSession(
  prisma: PrismaClient,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = "stf_" + crypto.randomBytes(32).toString("hex");
  const tokenHash = hashStaffToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.staffSession.create({
    data: {
      userId,
      tokenHash,
      ipAddress: ipAddress?.slice(0, 50) || null,
      userAgent: userAgent || null,
      expiresAt,
    },
  });

  return { token: rawToken, expiresAt };
}

/**
 * Validates a plaintext bearer token against staff_sessions.
 */
export async function validateStaffToken(
  prisma: PrismaClient,
  rawToken: string
): Promise<AuthenticatedStaffUser | null> {
  const tokenHash = hashStaffToken(rawToken);

  const session = await prisma.staffSession.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          roles: true,
        },
      },
    },
  });

  if (!session || !session.user) {
    return null;
  }

  // Session expiry check
  if (session.expiresAt.getTime() < Date.now()) {
    // Delete expired session asynchronously
    prisma.staffSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const { user } = session;

  // Active staff check
  if (!user.isStaff || user.status !== "ACTIVE") {
    return null;
  }

  const dbRoles = user.roles.map((r) => r.roleId);
  const unifiedRole = resolveUnifiedRole(dbRoles);

  if (!unifiedRole) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isStaff: user.isStaff,
    status: user.status,
    unifiedRole,
    dbRoles,
  };
}

/**
 * Fastify preHandler hook: Verifies that the request carries a valid Staff token.
 */
export async function verifyStaffAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "STAFF_AUTH_REQUIRED",
        message: "Staff authentication required. Bearer token missing.",
      },
    });
  }

  const rawToken = authHeader.substring(7);
  try {
    const staffUser = await validateStaffToken(req.server.prisma, rawToken);
    if (!staffUser) {
      return reply.status(401).send({
        success: false,
        error: {
          code: "INVALID_STAFF_TOKEN",
          message: "Staff session is invalid or has expired. Please sign in again.",
        },
      });
    }

    req.staffUser = staffUser;
    req.unifiedRole = staffUser.unifiedRole;
  } catch (err: any) {
    req.log.error(err, "Staff token validation error");
    return reply.status(500).send({
      success: false,
      error: { code: "AUTH_ERROR", message: "Failed to authenticate staff token." },
    });
  }
}

/**
 * Fastify preHandler hook: Requires Admin role (Administrator / Super Admin).
 * Blocks Editors with 403 Forbidden.
 */
export async function requireAdminRole(req: FastifyRequest, reply: FastifyReply) {
  await verifyStaffAuth(req, reply);
  if (reply.sent) return;

  if (req.unifiedRole !== "Admin") {
    return reply.status(403).send({
      success: false,
      error: {
        code: "ADMIN_ROLE_REQUIRED",
        message: "Access restricted to Administrators. Editors do not have permission for this resource.",
      },
    });
  }
}

/**
 * Fastify preHandler hook: Requires either Admin or Editor role.
 */
export async function requireEditorOrAdminRole(req: FastifyRequest, reply: FastifyReply) {
  await verifyStaffAuth(req, reply);
  if (reply.sent) return;

  if (req.unifiedRole !== "Admin" && req.unifiedRole !== "Editor") {
    return reply.status(403).send({
      success: false,
      error: {
        code: "STAFF_ROLE_REQUIRED",
        message: "Sufficient staff privileges are required to access this resource.",
      },
    });
  }
}
