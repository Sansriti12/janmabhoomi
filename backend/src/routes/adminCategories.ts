import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireAdminRole } from "../services/staffAuthService.js";

const createCategorySchema = z.object({
  id: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens"),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  nameEn: z.string().min(2, "English name is required").max(100),
  nameGu: z.string().min(2, "Gujarati name is required").max(100),
  descriptionEn: z.string().optional(),
  descriptionGu: z.string().optional(),
  parentId: z.string().max(50).nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const updateCategorySchema = z.object({
  nameEn: z.string().min(2).max(100).optional(),
  nameGu: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(60).optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionGu: z.string().nullable().optional(),
  parentId: z.string().max(50).nullable().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const reorderSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string(),
      displayOrder: z.number().int(),
    })
  ).min(1),
});

export const adminCategoriesRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAdminRole);

  /**
   * GET /api/v1/admin/categories
   * List all categories with hierarchy, article counts, and display order.
   */
  app.get("/", async (req, reply) => {
    const categories = await app.prisma.category.findMany({
      include: {
        parent: { select: { id: true, nameGu: true, nameEn: true, slug: true } },
        children: { select: { id: true, nameGu: true, nameEn: true, slug: true, isActive: true } },
        _count: { select: { articles: true } },
      },
      orderBy: [{ displayOrder: "asc" }, { slug: "asc" }],
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      nameEn: c.nameEn,
      nameGu: c.nameGu,
      descriptionEn: c.descriptionEn,
      descriptionGu: c.descriptionGu,
      parentId: c.parentId,
      parent: c.parent,
      children: c.children,
      displayOrder: c.displayOrder,
      isActive: c.isActive,
      articleCount: c._count.articles,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return reply.status(200).send({
      success: true,
      data: formatted,
    });
  });

  /**
   * POST /api/v1/admin/categories
   * Create category.
   */
  app.post("/", async (req, reply) => {
    const parseResult = createCategorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid category data",
        },
      });
    }

    const data = parseResult.data;

    const existing = await app.prisma.category.findFirst({
      where: { OR: [{ id: data.id }, { slug: data.slug }] },
    });

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: {
          code: "CATEGORY_ALREADY_EXISTS",
          message: `Category with ID '${data.id}' or slug '${data.slug}' already exists.`,
        },
      });
    }

    const category = await app.prisma.category.create({
      data: {
        id: data.id,
        slug: data.slug,
        nameEn: data.nameEn,
        nameGu: data.nameGu,
        descriptionEn: data.descriptionEn || null,
        descriptionGu: data.descriptionGu || null,
        parentId: data.parentId || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });

    return reply.status(201).send({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  });

  /**
   * PUT /api/v1/admin/categories/:id
   * Update category.
   */
  app.put("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = updateCategorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid input",
        },
      });
    }

    const category = await app.prisma.category.findUnique({ where: { id } });
    if (!category) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found." },
      });
    }

    const updated = await app.prisma.category.update({
      where: { id },
      data: parseResult.data,
    });

    return reply.status(200).send({
      success: true,
      message: "Category updated successfully.",
      data: updated,
    });
  });

  /**
   * PATCH /api/v1/admin/categories/reorder
   * Reorder categories.
   */
  app.patch("/reorder", async (req, reply) => {
    const parseResult = reorderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors[0]?.message || "Invalid reorder data",
        },
      });
    }

    const { orders } = parseResult.data;

    await app.prisma.$transaction(
      orders.map((item) =>
        app.prisma.category.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    return reply.status(200).send({
      success: true,
      message: "Categories reordered successfully.",
    });
  });
};
