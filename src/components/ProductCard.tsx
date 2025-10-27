"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  stockQuantity?: number;
  featured?: boolean;
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  // Legacy fields for backward compatibility
  image?: string | null;
  oldPrice?: number | null;
  priceFormatted?: string;
  oldPriceFormatted?: string;
  badge?: string | null;
  rating?: number;
  reviewCount?: number;
  stockCount?: number;
  inStock?: boolean;
};

type ProductCardProps = {
  product: Product;
  className?: string;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
};

export default function ProductCard({
  product,
  className,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const { addItem, setIsCartOpen } = useCart();

  // Handle both database and legacy product formats
  const name = product.name;
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || "Unknown Brand";
  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "Products";
  const image =
    product.images?.[0] || product.image || "/placeholder-product.png";
  const price = product.price;
  const oldPrice = product.compareAtPrice || product.oldPrice;
  const priceFormatted =
    product.priceFormatted || `RWF ${price.toLocaleString()}`;
  const oldPriceFormatted =
    product.oldPriceFormatted ||
    (oldPrice ? `RWF ${oldPrice.toLocaleString()}` : undefined);
  const description = product.description;
  const truncatedName = name.length > 60 ? name.slice(0, 60) + '...' : name;
  const truncatedDescription = description && description.length > 120 ? description.slice(0, 120) + '...' : description;
  const badge = product.badge || (product.featured ? "Featured" : undefined);
  const inStock = (product.stockQuantity ?? 0) > 0 || product.inStock !== false;

  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: image,
      brand: brandName,
      category: categoryName,
    });

    // Show success toast
    toast.success(`${product.name} added to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => setIsCartOpen(true),
      },
    });

    // Call optional callback
    onAddToCart?.(product);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-gray-200 bg-background shadow-sm transition-all hover:shadow-lg h-[450px]",
        "focus-within:ring-2 focus-within:ring-blue-500",
        className
      )}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {!!badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            {badge}
          </span>
        )}
        {discount !== undefined && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            -{discount}%
          </span>
        )}
        <Image
          src={image || "/placeholder-product.png"}
          alt={`${name} - ${brandName} ${categoryName} available at KT Computer Supply Rwanda`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-contain h-full transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          quality={85}
        />

        {/* Hover actions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ShoppingCart className="h-4 w-4" /> Add to cart
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist?.(product);
            }}
            className="hidden pointer-events-auto  items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-gray-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 p-4">
        <div className="text-xs font-medium text-gray-500">{brandName}</div>
        <div className="line-clamp-2 text-sm font-semibold text-gray-900">
          {truncatedName}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < Math.floor(product.rating!)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {product.rating} ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Description */}
        {truncatedDescription && (
          <div className="text-xs text-gray-600">{truncatedDescription}</div>
        )}

        {/* Price and Stock */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="text-base font-bold text-gray-900"
              suppressHydrationWarning
            >
              {priceFormatted ?? price}
            </div>
            {oldPrice !== undefined && (
              <div
                className="text-sm text-gray-400 line-through"
                suppressHydrationWarning
              >
                {oldPriceFormatted ?? oldPrice}
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.stockCount !== undefined && (
            <div className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-gray-400" />
              {product.stockCount > 0 ? (
                <span
                  className={cn(
                    "text-xs font-medium",
                    product.stockCount <= 5
                      ? "text-orange-600"
                      : "text-green-600"
                  )}
                >
                  {product.stockCount <= 5
                    ? `Only ${product.stockCount} left`
                    : `${product.stockCount} in stock`}
                </span>
              ) : (
                <span className="text-xs font-medium text-red-600">
                  Out of stock
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
