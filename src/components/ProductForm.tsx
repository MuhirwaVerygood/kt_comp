"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dropzone, ImagePreview } from "@/components/ui/dropzone";
import { useBrands, useCategories } from "@/hooks/use-api";

interface ProductFormData {
   name: string;
   slug: string;
   description: string;
   price: number;
   oldPrice?: number;
   stockCount: number;
   categoryId: string;
   brandId: string;
   image?: string;
   images: string[];
   model3dId?: string;
   badge?: string;
   rating?: number;
   reviewCount?: number;
   inStock: boolean;
   featured: boolean;
 }

interface ProductFormProps {
  product?: any;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [rating, setRating] = useState<number>(product?.rating || 0);
  const [reviewCount, setReviewCount] = useState<number>(product?.reviewCount || 0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      price: product?.price || 0,
      oldPrice: product?.oldPrice || undefined,
      stockCount: product?.stockCount || 0,
      categoryId: product?.category?.id || product?.categoryId || "",
      brandId: product?.brand?.id || product?.brandId || "",
      image: product?.image || "",
      images: product?.images || [],
      model3dId: product?.model3dId || "",
      badge: product?.badge || "",
      rating: product?.rating || 0,
      reviewCount: product?.reviewCount || 0,
      inStock: product?.inStock ?? true,
      featured: product?.featured || false,
    },
  });

  const featured = watch("featured");

  useEffect(() => {
    setValue("images", images);
  }, [images, setValue]);

  // Update form values when product changes
  useEffect(() => {
    if (product) {
      setValue("name", product.name || "");
      setValue("slug", product.slug || "");
      setValue("description", product.description || "");
      setValue("price", product.price || 0);
      setValue("oldPrice", product.oldPrice || undefined);
      setValue("stockCount", product.stockCount || 0);
      setValue("categoryId", product.category?.id || product.categoryId || "");
      setValue("brandId", product.brand?.id || product.brandId || "");
      setValue("image", product.image || "");
      setValue("images", product.images || []);
      setValue("model3dId", product.model3dId || "");
      setValue("badge", product.badge || "");
      setValue("rating", product.rating || 0);
      setValue("reviewCount", product.reviewCount || 0);
      setValue("inStock", product.inStock ?? true);
      setValue("featured", product.featured || false);

      // Update local state
      setImages(product.images || []);
      setRating(product.rating || 0);
      setReviewCount(product.reviewCount || 0);
    }
  }, [product, setValue]);

  const handleFilesChange = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const token = localStorage.getItem("auth-token");
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          return result.data.url;
        }
        throw new Error("Upload failed");
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      // Generate slug from name if not provided
      const slug =
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      // Set image to first uploaded image if available
      const image = images.length > 0 ? images[0] : undefined;

      // Clean up the data - remove NaN and undefined values
      const cleanedData: any = {
        ...data,
        slug,
        image,
        images,
        inStock: data.stockCount > 0,
      };

      // Remove NaN values and convert to null/undefined
      if (isNaN(cleanedData.oldPrice) || cleanedData.oldPrice === 0) {
        delete cleanedData.oldPrice;
      }

      // Clean model3dId - remove if empty string
      if (cleanedData.model3dId === "") {
        delete cleanedData.model3dId;
      }

      // Clean badge - remove if empty string
      if (cleanedData.badge === "") {
        delete cleanedData.badge;
      }

      await onSubmit(cleanedData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          {...register("name", { required: "Product name is required" })}
          placeholder="e.g., MacBook Pro 14-inch M3"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register("description", { required: "Description is required" })}
          placeholder="Detailed product description..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Category and Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <Select
            onValueChange={(value) => setValue("categoryId", value)}
            value={watch("categoryId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoriesLoading ? (
                <SelectItem value="loading-categories" disabled>
                  Loading...
                </SelectItem>
              ) : categories && categories.length > 0 ? (
                categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-categories" disabled>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandId">Brand *</Label>
          <Select
            onValueChange={(value) => setValue("brandId", value)}
            value={watch("brandId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brandsLoading ? (
                <SelectItem value="loading-brands" disabled>
                  Loading...
                </SelectItem>
              ) : brands && brands.length > 0 ? (
                brands.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-brands" disabled>
                  No brands available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.brandId && (
            <p className="text-sm text-destructive">{errors.brandId.message}</p>
          )}
        </div>
      </div>

      {/* Price and Compare At Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (RWF) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", {
              required: "Price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Price must be positive" },
            })}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="oldPrice">Compare At Price (RWF)</Label>
          <Input
            id="oldPrice"
            type="number"
            step="0.01"
            {...register("oldPrice", { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Stock, Rating and Review Count */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stockCount">Stock Quantity *</Label>
          <Input
            id="stockCount"
            type="number"
            {...register("stockCount", {
              required: "Stock is required",
              valueAsNumber: true,
              min: { value: 0, message: "Stock must be positive" },
            })}
            placeholder="0"
          />
          {errors.stockCount && (
            <p className="text-sm text-destructive">
              {errors.stockCount.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            {...register("rating", {
              valueAsNumber: true,
              min: { value: 0, message: "Rating must be at least 0" },
              max: { value: 5, message: "Rating must be at most 5" },
            })}
            placeholder="0.0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reviewCount">Review Count</Label>
          <Input
            id="reviewCount"
            type="number"
            {...register("reviewCount", {
              valueAsNumber: true,
              min: { value: 0, message: "Review count must be positive" },
            })}
            placeholder="0"
          />
        </div>
      </div>

      {/* 3D Model ID */}
      <div className="space-y-2">
        <Label htmlFor="model3dId">
          Sketchfab 3D Model ID{" "}
          <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Input
          id="model3dId"
          {...register("model3dId")}
          placeholder="e.g., efab224280fd4c3993c808107f7c0b38"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter the Sketchfab model ID to display a 3D preview of this product
        </p>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={featured}
          onCheckedChange={(checked) => setValue("featured", checked)}
        />
        <Label htmlFor="featured">Featured Product</Label>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Product Images</Label>
        <Dropzone
          onFilesChange={handleFilesChange}
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
          accept="image/*"
          disabled={uploading}
        />

        {/* Image Preview */}
        <ImagePreview images={images} onRemove={removeImage} />

        {uploading && (
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm">Uploading...</span>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {product ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{product ? "Update Product" : "Create Product"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
