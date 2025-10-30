import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    console.log('Products API: Query params:', { search, category, brand, categoryId, brandId, featured, limit, page });

    const where: any = {};

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Category filter
    if (category) {
      where.category = { slug: category };
    }

    // Category ID filter (for dashboard)
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Brand filter
    if (brand) {
      where.brand = { slug: brand };
    }

    // Brand ID filter (for dashboard)
    if (brandId) {
      where.brandId = brandId;
    }

    // Featured filter
    if (featured === "true") {
      where.featured = true;
    }

    // For search dropdown, prioritize in-stock items
    if (search && limit <= 10) {
      where.inStock = true;
    }

    console.log('Products API: Where clause:', where);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          images: true,
          price: true,
          inStock: true,
          stockCount: true,
          featured: true,
          rating: true,
          model3dId: true,
          createdAt: true,
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { inStock: "desc" },
          { featured: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.product.count({ where }),
    ]);

    console.log('Products API: Found products count:', total);
    console.log('Products API: Products:', products.map(p => ({ id: p.id, name: p.name, brand: p.brand?.name, category: p.category?.name })));

    // For category pages, return featured and all products separately
    if (category && !search) {
      const featuredProducts = products.filter(p => p.featured);
      const allProducts = products;

      return NextResponse.json({
        success: true,
        featured: featuredProducts,
        all: allProducts,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      brandId,
      categoryId,
      image,
      images,
      inStock,
      stockCount,
      featured,
      rating,
      reviewCount
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        brandId,
        categoryId,
        image,
        images: images || [],
        inStock: inStock ?? true,
        stockCount: parseInt(stockCount) || 0,
        featured: featured ?? false,
        rating: rating ? parseFloat(rating) : 0,
        reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      },
      include: {
        brand: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}