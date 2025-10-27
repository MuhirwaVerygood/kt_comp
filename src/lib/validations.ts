import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

// Product validations
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  price: z.number().int().positive("Price must be a positive number"),
  oldPrice: z.number().int().positive().optional().nullable(),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  model3dId: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().default(0),
  reviewCount: z.number().int().min(0).optional().default(0),
  stockCount: z.number().int().min(0, "Stock count cannot be negative"),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
});

export const updateProductSchema = productSchema.partial();

// Category validations
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export const updateCategorySchema = categorySchema.partial();

// Brand validations
export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const updateBrandSchema = brandSchema.partial();

// Order validations
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Order must have at least one item"),
  shippingAddress: z.string().min(5, "Shipping address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

// Review validations
export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

// Cart validations
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be positive"),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
