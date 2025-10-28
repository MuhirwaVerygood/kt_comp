"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings,
  SquareTerminal,
  Store,
  Package,
  Users,
  TrendingUp,
  BarChart3,
  Tag,
  Headphones,
  FileText,
  ReceiptText,
  CreditCard,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Admin User",
    email: "admin@ktcomputersupply.com",
    avatar: "/avatars/admin.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ReceiptText,
      items: [
        {
          title: "All Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Pending",
          url: "/dashboard/orders/pending",
        },
        {
          title: "Processing",
          url: "/dashboard/orders/processing",
        },
        // {
        //   title: "Shipped",
        //   url: "/dashboard/orders/shipped",
        // },
        // {
        //   title: "Completed",
        //   url: "/dashboard/orders/completed",
        // },
      ],
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: Package,
      items: [
        {
          title: "All Products",
          url: "/dashboard/products",
        },
        {
          title: "Categories",
          url: "/dashboard/products/categories",
        },
        // {
        //   title: "Inventory",
        //   url: "/dashboard/products/inventory",
        // },
        // Removed "Add Product" link since we're using a modal now
      ],
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: Users,
      items: [
        {
          title: "Customer List",
          url: "/dashboard/customers",
        },
        // {
        //   title: "Groups",
        //   url: "/dashboard/customers/groups",
        // },
        {
          title: "Reviews",
          url: "/dashboard/customers/reviews",
        },
      ],
    },
    // {
    //   title: "Marketing",
    //   url: "/dashboard/marketing",
    //   icon: TrendingUp,
    //   items: [
    //     {
    //       title: "Coupons",
    //       url: "/dashboard/marketing/coupons",
    //     },
    //     {
    //       title: "Email Campaigns",
    //       url: "/dashboard/marketing/campaigns",
    //     },
    //     {
    //       title: "Affiliates",
    //       url: "/dashboard/marketing/affiliates",
    //     },
    //   ],
    // },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Reports",
          url: "/dashboard/analytics/reports",
        },
        {
          title: "Sales",
          url: "/dashboard/analytics/sales",
        },
        // {
        //   title: "Traffic",
        //   url: "/dashboard/analytics/traffic",
        // },
      ],
    },
    {
      title: "Brands",
      url: "/dashboard/brands",
      icon: Tag,
      // items: [
      //   {
      //     title: "All Brands",
      //     url: "/dashboard/brands",
      //   },
      //   {
      //     title: "Add Brand",
      //     url: "/dashboard/brands/add",
      //   },
      // ],
    },
    // {
    //   title: "Logs",
    //   url: "/dashboard/logs",
    //   icon: FileText,
    //   items: [
    //     {
    //       title: "Activity Logs",
    //       url: "/dashboard/logs",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "/dashboard/settings",
    //   icon: Settings,
    //   items: [
    //     {
    //       title: "General",
    //       url: "/dashboard/settings",
    //     },
    //     {
    //       title: "User Profile",
    //       url: "/dashboard/settings/profile",
    //     },
    //     {
    //       title: "Payments",
    //       url: "/dashboard/settings/payments",
    //     },
    //     {
    //       title: "Shipping",
    //       url: "/dashboard/settings/shipping",
    //     },
    //     {
    //       title: "Notifications",
    //       url: "/dashboard/settings/notifications",
    //     },
    //   ],
    // },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: Headphones,
    },
    {
      title: "Stripe Dashboard",
      url: "https://dashboard.stripe.com/",
      icon: TrendingUp,
    },
    {
      title: "PayPack Dashboard",
      url: "https://payments.paypack.rw/login",
      icon: CreditCard,
    },
    {
      title: "Storefront",
      url: "/",
      icon: Store,
    },
  ],
  projects: [
    {
      name: "Computers",
      url: "/computers",
      icon: Package,
    },
    {
      name: "Phones",
      url: "/phones",
      icon: Package,
    },
    {
      name: "Printers",
      url: "/printers",
      icon: Package,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/logo.png" alt="logo" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    <span className="text-primary font-bold">KT</span> Computer
                    Supply
                  </span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
