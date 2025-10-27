"use client";

import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardGuard } from "@/components/DashboardGuard";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/ProductForm";
import Product3DModal from "@/components/Product3DModal";
import {
  useProducts,
  useCategories,
  useBrands,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-api";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch data
  const {
    data: productsData,
    isLoading,
    mutate: refetchProducts,
  } = useProducts({
    search,
    categoryId:
      categoryFilter && categoryFilter !== "all-categories"
        ? categoryFilter
        : undefined,
    brandId:
      brandFilter && brandFilter !== "all-brands" ? brandFilter : undefined,
    page,
    limit: 20,
  });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  // Mutations
  const { trigger: createProduct } = useCreateProduct();
  const { trigger: updateProduct } = useUpdateProduct(
    selectedProduct?.id || ""
  );
  const { trigger: deleteProduct } = useDeleteProduct(
    selectedProduct?.id || ""
  );

  console.log('Products Data:', productsData);
  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  console.log('Products:', products);
  console.log('Pagination:', pagination);

  // Handlers
  const handleAddProduct = async (data: any) => {
    try {
      console.log(data);
      await createProduct(data);
      toast.success("Product created successfully");
      setIsAddModalOpen(false);
      refetchProducts();
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(error.message || "Failed to create product");
    }
  };

  const handleEditProduct = async (data: any) => {
    try {
      await updateProduct(data);
      toast.success("Product updated successfully");
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      refetchProducts();
    } catch (error: any) {
      console.error("Failed to update product:", error);
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct?.id) {
      toast.error("No product selected");
      return;
    }

    try {
      await deleteProduct();
      toast.success(`Product "${selectedProduct.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      refetchProducts();
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AuthProvider>
      <DashboardGuard>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Products</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Products</CardTitle>
                      <CardDescription>
                        Manage your product inventory
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col gap-4 mb-6 md:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">
                          All Categories
                        </SelectItem>
                        {Array.isArray(categories) && categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-brands">All Brands</SelectItem>
                        {Array.isArray(brands) && brands.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Products Table */}
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">
                        No products found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {search || categoryFilter || brandFilter
                          ? "Try adjusting your filters"
                          : "Get started by adding your first product"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Brand</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-[80px]">3D</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product: any) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  {(product.images && product.images[0]) || product.image ? (
                                    <img
                                      src={product.images?.[0] || product.image}
                                      alt={product.name}
                                      className="h-12 w-12 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {product.name}
                                </TableCell>
                                <TableCell>{product.category?.name}</TableCell>
                                <TableCell>{product.brand?.name}</TableCell>
                                <TableCell>
                                  {formatPrice(product.price)}
                                </TableCell>
                                <TableCell>{product.stockCount || product.stockQuantity}</TableCell>
                                <TableCell>
                                  {(product.stockCount || product.stockQuantity) > 0 || product.inStock ? (
                                    <Badge variant="default">In Stock</Badge>
                                  ) : (
                                    <Badge variant="destructive">
                                      Out of Stock
                                    </Badge>
                                  )}
                                  {product.featured && (
                                    <Badge variant="secondary" className="ml-1">
                                      Featured
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {product.model3dId ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedProduct(product);
                                        setIs3DModalOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      N/A
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedProduct(product);
                                          setIsViewModalOpen(true);
                                        }}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedProduct(product);
                                          setIsEditModalOpen(true);
                                        }}
                                      >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedProduct(product);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-muted-foreground">
                            Showing {products.length} of {pagination.total}{" "}
                            products
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(page - 1)}
                              disabled={page === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(page + 1)}
                              disabled={page === pagination.totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add Product Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new product to your inventory
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  onSubmit={handleAddProduct}
                  onCancel={() => setIsAddModalOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update the product details
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  product={selectedProduct}
                  onSubmit={handleEditProduct}
                  onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                  }}
                />
              </DialogContent>
            </Dialog>

            {/* View Product Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Product Details</DialogTitle>
                </DialogHeader>
                {selectedProduct && (
                  <div className="space-y-6">
                    {/* Images */}
                    {((selectedProduct.images && selectedProduct.images.length > 0) || selectedProduct.image) && (
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProduct.images ? (
                          selectedProduct.images.map(
                            (img: string, idx: number) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${selectedProduct.name} ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            )
                          )
                        ) : (
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Name
                        </Label>
                        <p className="text-sm">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Category
                        </Label>
                        <p className="text-sm">
                          {selectedProduct.category?.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Brand
                        </Label>
                        <p className="text-sm">{selectedProduct.brand?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Price
                        </Label>
                        <p className="text-sm">
                          {formatPrice(selectedProduct.price)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Stock
                        </Label>
                        <p className="text-sm">{selectedProduct.stockCount || selectedProduct.stockQuantity}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Status
                        </Label>
                        <p className="text-sm">
                          {(selectedProduct.stockCount || selectedProduct.stockQuantity) > 0 || selectedProduct.inStock
                            ? "In Stock"
                            : "Out of Stock"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-sm mt-1">
                        {selectedProduct.description}
                      </p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{selectedProduct?.name}". This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedProduct(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProduct}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* 3D Preview Modal */}
            <Product3DModal
              isOpen={is3DModalOpen}
              onClose={() => {
                setIs3DModalOpen(false);
                setSelectedProduct(null);
              }}
              productName={selectedProduct?.name || ""}
              sketchfabModelId={selectedProduct?.model3dId}
            />
          </SidebarInset>
        </SidebarProvider>
      </DashboardGuard>
    </AuthProvider>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
