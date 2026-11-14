import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAdminRole, resolveUnifiedRole } from "../services/staffAuthService.js";
import { hashPassword } from "../services/passwordService.js";

const createStaffSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("A valid email address is required").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["Admin", "Editor"], {
    errorMap: () => ({ message: "Role must be either 'Admin' or 'Editor'" }),
  }),
});

const updateRoleSchema = z.object({
  role: z.enum(["Admin", "Editor"], {
    errorMap: () => ({ message: "Role must be either 'Admin' or 'Editor'" }),
  }),
});

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DEACTIVATED", "SUSPENDED"], {
    errorMap: () => ({ message: "Status must be ACTIVE, DEACTIVATED, or SUSPENDED" }),
  }),
});

export const adminStaffRoutes: FastifyPluginAsync = async (app) => {
  // All staff management routes require the Admin role
  app.addHook("preHandler", requireAdminRole);

  /**
   * GET /api/v1/admin/staff
   * Lists all staff members with mapped unified role (Admin / Editor).
   */
  app.get("/", async (req, reply) => {
    const users = await app.prisma.user.findMany({
      where: { isStaff: true },
      include: {
        roles: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const staffList = users.map((u) => {
      const dbRoles = u.roles.map((r) => r.roleId);
      const unifiedRole = resolveUnifiedRole(dbRoles) || "Editor";

      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: unifiedRole,
        status: u.status,
        lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      };
    });

    return reply.status(200).send({
      success: true,
      data: staffList,
    });
  });

  /**
   * POST /api/v1/admin/staff
   * Creates a new staff member and assigns Admin or Editor role.
   */
  app.post("/", async (req, reply) => {
    const parseResult = createStaffSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid input",
        },
      });
    }

    const { fullName, email, password, role } = parseResult.data;

    const existingUser = await app.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "A user with this email address already exists.",
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const dbRoleId = role === "Admin" ? "administrator" : "editor";

    // Create user and assign role in a transaction
    const newUser = await app.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          isStaff: true,
          status: "ACTIVE",
        },
      });

      await tx.userRole.create({
        data: {
          userId: u.id,
          roleId: dbRoleId,
        },
      });

      return u;
    });

    return reply.status(201).send({
      success: true,
      message: `Staff member created successfully with ${role} role.`,
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role,
        status: newUser.status,
        createdAt: newUser.createdAt.toISOString(),
      },
    });
  });

  /**
   * PUT /api/v1/admin/staff/:id/role
   * Updates staff member role (Admin or Editor).
   */
  app.put("/:id/role", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = updateRoleSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid input",
        },
      });
    }

    const { role } = parseResult.data;

    const targetUser = await app.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!targetUser || !targetUser.isStaff) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Staff user not found." },
      });
    }

    // Safety: prevent demoting own account if caller is this user
    if (req.staffUser?.id === id && role !== "Admin") {
      return reply.status(400).send({
        success: false,
        error: {
          code: "CANNOT_DEMOTE_SELF",
          message: "You cannot remove your own Admin privileges.",
        },
      });
    }

    const dbRoleId = role === "Admin" ? "administrator" : "editor";

    await app.prisma.$transaction(async (tx) => {
      // Remove previous roles
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      // Add new role
      await tx.userRole.create({
        data: {
          userId: id,
          roleId: dbRoleId,
        },
      });
    });

    return reply.status(200).send({
      success: true,
      message: `Staff role updated to ${role}.`,
      data: {
        id: targetUser.id,
        role,
      },
    });
  });

  /**
   * PATCH /api/v1/admin/staff/:id/status
   * Activates or deactivates a staff member account.
   */
  app.patch("/:id/status", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = updateStatusSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid input",
        },
      });
    }

    const { status } = parseResult.data;

    // Safety: cannot deactivate self
    if (req.staffUser?.id === id && status !== "ACTIVE") {
      return reply.status(400).send({
        success: false,
        error: {
          code: "CANNOT_DEACTIVATE_SELF",
          message: "You cannot deactivate your own account.",
        },
      });
    }

    const targetUser = await app.prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser || !targetUser.isStaff) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Staff user not found." },
      });
    }

    const updated = await app.prisma.user.update({
      where: { id },
      data: { status: status as any },
    });

    // If deactivated or suspended, revoke all active sessions immediately
    if (status !== "ACTIVE") {
      await app.prisma.staffSession.deleteMany({
        where: { userId: id },
      });
    }

    return reply.status(200).send({
      success: true,
      message: `Staff account status changed to ${status}.`,
      data: {
        id: updated.id,
        status: updated.status,
      },
    });
  });
};
