"use client";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardGuard } from "@/components/DashboardGuard";
import { useOrders } from "@/hooks/use-api";
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
  Search,
  Download,
  Filter,
  Loader2,
  Eye,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
} from "lucide-react";
import Image from "next/image";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { data, isLoading, mutate } = useOrders({ page, limit: 20 });

  const formatCurrency = (value: number) => {
    return `RWF ${value.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter orders based on search and status
  const orders = data?.orders || [];
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge variant="default">Delivered</Badge>;
      case "PROCESSING":
        return <Badge variant="secondary">Processing</Badge>;
      case "SHIPPED":
        return <Badge className="bg-blue-500">Shipped</Badge>;
      case "PENDING":
        return <Badge variant="destructive">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Orders</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Orders</h1>
                  {data?.pagination && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {data.pagination.total} total orders
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>All Orders</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search orders..."
                          className="pl-8 w-full md:w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <CardDescription>
                    Manage and track all customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !data || filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== "all"
                          ? "No orders found matching your filters"
                          : "No orders yet"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {order.user?.name ||
                                      order.customerName ||
                                      "N/A"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.user?.email || order.customerEmail}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(order.createdAt)}
                              </TableCell>
                              <TableCell>{order.orderItems.length}</TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(order.totalAmount)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(order.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {data?.pagination && data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-muted-foreground">
                            Page {data.pagination.page} of{" "}
                            {data.pagination.totalPages}
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
                              disabled={page === data.pagination.totalPages}
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

            {/* Order View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogDescription>
                    Order #{selectedOrder?.orderNumber}
                  </DialogDescription>
                </DialogHeader>
                {selectedOrder && (
                  <div className="space-y-6">
                    {/* Order Status and Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium mt-1">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment</p>
                        <p className="font-medium mt-1">
                          {selectedOrder.paymentStatus}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Customer Information */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <User className="h-4 w-4" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">
                            {selectedOrder.user?.name ||
                              selectedOrder.customerName ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">
                            {selectedOrder.user?.email ||
                              selectedOrder.customerEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">
                            {selectedOrder.shippingPhone || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="font-medium">
                          {selectedOrder.shippingAddress}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedOrder.shippingCity},{" "}
                          {selectedOrder.shippingDistrict || ""}
                        </p>
                        {selectedOrder.shippingPostalCode && (
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.shippingPostalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4" />
                        Order Items ({selectedOrder.orderItems.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.orderItems.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex gap-4 bg-muted/50 p-4 rounded-lg"
                          >
                            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-white flex-shrink-0">
                              {item.product?.images?.[0] ? (
                                <Image
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {item.product?.name || "Product"}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                {formatCurrency(item.price)} × {item.quantity} ={" "}
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <CreditCard className="h-4 w-4" />
                        Payment Summary
                      </h3>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span className="font-medium">
                            {formatCurrency(
                              selectedOrder.orderItems.reduce(
                                (sum: number, item: any) =>
                                  sum + item.price * item.quantity,
                                0
                              )
                            )}
                          </span>
                        </div>
                        {selectedOrder.shippingCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Shipping
                            </span>
                            <span className="font-medium">
                              {formatCurrency(selectedOrder.shippingCost)}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-blue-600">
                            {formatCurrency(selectedOrder.totalAmount)}
                          </span>
                        </div>
                        {selectedOrder.stripePaymentIntentId && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Payment ID: {selectedOrder.stripePaymentIntentId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Update Status */}
                    {/* <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <Truck className="h-4 w-4" />
                        Update Order Status
                      </h3>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => {
                          // TODO: Implement status update
                          console.log("Update status to:", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewModalOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </SidebarInset>
        </SidebarProvider>
      </DashboardGuard>
    </AuthProvider>
  );
}
