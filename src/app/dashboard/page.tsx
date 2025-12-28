"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardGuard } from "@/components/DashboardGuard";
import { useDashboard } from "@/hooks/use-api";
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
} from "../../components/ui/card";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  CreditCard,
  Loader2,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Page() {
  const { data: dashboard, isLoading } = useDashboard();

  const formatCurrency = (value: number) => {
    return `RWF ${value.toLocaleString()}`;
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span
        className={`flex items-center gap-1 text-xs ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isPositive ? "+" : ""}
        {growth}% from last month
      </span>
    );
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
                      <BreadcrumbPage>Overview</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !dashboard ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Failed to load dashboard data
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="relative">
                        <CardTitle className="text-sm font-medium">
                          Total Revenue
                        </CardTitle>
                        <DollarSign className="size-10 text-muted-foreground absolute right-4" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {/* @ts-ignore */}
                          {formatCurrency(dashboard.overview.totalRevenue)}
                        </div>
                        {/* @ts-ignore */}
                        {formatGrowth(dashboard.overview.revenueGrowth)}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="relative">
                        <CardTitle className="text-sm font-medium">
                          Orders
                        </CardTitle>
                        <ShoppingCart className="size-10 text-muted-foreground absolute right-4" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {/* @ts-ignore */}
                          {dashboard.overview.totalOrders.toLocaleString()}
                        </div>
                        {/* @ts-ignore */}
                        {formatGrowth(dashboard.overview.ordersGrowth)}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="relative">
                        <CardTitle className="text-sm font-medium">
                          Products
                        </CardTitle>
                        <Package className="size-10 text-muted-foreground absolute right-4" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {/* @ts-ignore */}
                          {dashboard.overview.totalProducts.toLocaleString()}
                        </div>
                        {/* @ts-ignore */}
                        {formatGrowth(dashboard.overview.productsGrowth)}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="relative">
                        <CardTitle className="text-sm font-medium">
                          Active Customers
                        </CardTitle>
                        <Users className="size-10 text-muted-foreground absolute right-4" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {/* @ts-ignore */}
                          {dashboard.overview.activeCustomers.toLocaleString()}
                        </div>
                        {/* @ts-ignore */}
                        {formatGrowth(dashboard.overview.customersGrowth)}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="md:col-span-4">
                      <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            // @ts-ignore
                            data={dashboard.salesData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => [
                                `RWF ${(value ?? 0).toLocaleString()}`,
                                "Revenue",
                              ]}
                              labelFormatter={(label) => `Month: ${label}`}
                            />
                            <Bar
                              dataKey="revenue"
                              fill="#3b82f6"
                              name="Revenue"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="md:col-span-3">
                      <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>
                          Best selling products this month
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* @ts-ignore */}
                          {dashboard.topProducts.map(
                            (product: any, index: number) => (
                              <div key={index} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.brand} • {product.quantity} sold
                                  </p>
                                </div>
                                <div className="ml-auto font-medium">
                                  {formatCurrency(product.revenue)}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="md:col-span-4">
                      <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                          Latest customer orders
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* @ts-ignore */}
                          {dashboard.recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center">
                              <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {order.orderNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.customer} • {order.items} items
                                </p>
                              </div>
                              <div className="ml-auto font-medium">
                                {formatCurrency(order.total)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="md:col-span-3">
                      <CardHeader>
                        <CardTitle>Store Performance</CardTitle>
                        <CardDescription>
                          Key metrics and insights
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>Conversion Rate</span>
                          </div>
                          <span className="font-medium">
                            {/* @ts-ignore */}
                            {dashboard.performance.conversionRate}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>Avg. Order Value</span>
                          </div>
                          <span className="font-medium">
                            {formatCurrency(
                              // @ts-ignore
                              dashboard.performance.averageOrderValue
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>Customer Retention</span>
                          </div>
                          <span className="font-medium">
                            {/* @ts-ignore */}
                            {dashboard.performance.customerRetention}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>Inventory Turnover</span>
                          </div>
                          <span className="font-medium">
                            {/* @ts-ignore */}
                            {dashboard.performance.inventoryTurnover}x
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </DashboardGuard>
    </AuthProvider>
  );
}
