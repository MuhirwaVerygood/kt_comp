import useSWR, { SWRConfiguration } from "swr";
import useSWRMutation from "swr/mutation";

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth-token");
  }
  return null;
};

// Fetcher function for SWR with Authorization header
const fetcher = async (url: string) => {
  const token = getToken();
  // console.log("Token from localStorage:", token);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // console.log("Headers being sent:", headers);

  const res = await fetch(url, {
    headers,
  });

  if (!res.ok) {
    const error: any = new Error("An error occurred while fetching the data.");
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

// Generic API hook
export function useApi<T>(url: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data?: T;
    products?: any[];
    pagination?: any;
    message?: string;
  }>(url, fetcher, config);

  return {
    data: data?.success ? (data.data || data.products || data) : (Array.isArray(data) ? data : null) as T,
    isLoading,
    isError: error,
    mutate,
  };
}

// Products hooks
export function useProducts(params?: {
  categoryId?: string;
  brandId?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.categoryId) queryParams.set("categoryId", params.categoryId);
  if (params?.brandId) queryParams.set("brandId", params.brandId);
  if (params?.featured) queryParams.set("featured", "true");
  if (params?.search) queryParams.set("search", params.search);
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const url = `/api/products${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher);
  
  console.log('Raw products API response:', data);
  
  return {
    data: data?.success ? {
      products: data.data?.products || data.products || [],
      pagination: data.data?.pagination || data.pagination
    } : null,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProduct(id: string | null) {
  return useApi<any>(id ? `/api/products/${id}` : null);
}

// Categories hooks
export function useCategories() {
  const { data, isLoading, error, mutate } = useSWR("/api/categories", fetcher);
  return {
    data: data?.success ? (data.data || data.categories || []) : (Array.isArray(data) ? data : []),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCategory(id: string | null) {
  return useApi<any>(id ? `/api/categories/${id}` : null);
}

// Brands hooks
export function useBrands() {
  const { data, isLoading, error, mutate } = useSWR("/api/brands", fetcher);
  return {
    data: data?.success ? (data.data || data.brands || []) : (Array.isArray(data) ? data : []),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBrand(id: string | null) {
  return useApi<any>(id ? `/api/brands/${id}` : null);
}

// Orders hooks
export function useOrders(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const url = `/api/orders${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher);
  
  return {
    data: data?.success ? {
      orders: data.data?.orders || data.orders || [],
      pagination: data.data?.pagination || data.pagination
    } : { orders: [], pagination: null },
    isLoading,
    isError: error,
    mutate,
  };
}

export function useOrder(id: string | null) {
  return useApi<any>(id ? `/api/orders/${id}` : null);
}

// Current user hook
export function useCurrentUser() {
  return useApi<any>("/api/auth/me");
}

// Profile hooks
export function useProfile<T = any>() {
  const { data, isLoading, error, mutate } = useSWR("/api/auth/me", fetcher);
  return {
    data: data?.success ? (data.data || data.user || data) : data as T,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUpdateProfile() {
  return useSWRMutation("/api/auth/profile", updateRequest);
}

export function useChangePassword() {
  return useSWRMutation("/api/auth/change-password", updateRequest);
}

// Cart hook
export function useCart() {
  return useApi<any[]>("/api/cart");
}

// Mutation helpers
async function sendRequest(url: string, { arg }: { arg: any }) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(arg),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function updateRequest(url: string, { arg }: { arg: any }) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("Update request payload:", arg);

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(arg),
  });

  const data = await res.json();

  console.log("Update response:", { ok: res.ok, status: res.status, data });

  if (!res.ok) {
    throw new Error(data.error || "Failed to update product");
  }

  return data;
}

async function deleteRequest(url: string) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Auth mutations
export function useLogin() {
  return useSWRMutation("/api/auth/login", sendRequest);
}

export function useRegister() {
  return useSWRMutation("/api/auth/register", sendRequest);
}

export function useLogout() {
  return useSWRMutation("/api/auth/logout", sendRequest);
}

// Product mutations
export function useCreateProduct() {
  return useSWRMutation("/api/products", sendRequest);
}

export function useUpdateProduct(id: string) {
  return useSWRMutation(`/api/products/${id}`, updateRequest);
}

export function useDeleteProduct(id: string) {
  return useSWRMutation(`/api/products/${id}`, async () => {
    return await deleteRequest(`/api/products/${id}`);
  });
}

// Category mutations
export function useCreateCategory() {
  return useSWRMutation("/api/categories", sendRequest);
}

export function useUpdateCategory(id: string) {
  return useSWRMutation(`/api/categories/${id}`, updateRequest);
}

export function useDeleteCategory(id: string) {
  return useSWRMutation(`/api/categories/${id}`, () =>
    deleteRequest(`/api/categories/${id}`)
  );
}

// Brand mutations
export function useCreateBrand() {
  return useSWRMutation("/api/brands", sendRequest);
}

export function useUpdateBrand(id: string) {
  return useSWRMutation(`/api/brands/${id}`, updateRequest);
}

export function useDeleteBrand(id: string) {
  return useSWRMutation(`/api/brands/${id}`, () =>
    deleteRequest(`/api/brands/${id}`)
  );
}

// Order mutations
export function useCreateOrder() {
  return useSWRMutation("/api/orders", sendRequest);
}

export function useUpdateOrderStatus(id: string) {
  return useSWRMutation(`/api/orders/${id}`, updateRequest);
}

export function useCancelOrder(id: string) {
  return useSWRMutation(`/api/orders/${id}`, () =>
    deleteRequest(`/api/orders/${id}`)
  );
}

// User hooks
export function useUsers(params?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const url = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useApi(url);
}

export function useUser(id?: string) {
  return useApi(id ? `/api/users/${id}` : null);
}

export function useDeleteUser(id: string) {
  return useSWRMutation(`/api/users/${id}`, () =>
    deleteRequest(`/api/users/${id}`)
  );
}

// Review hooks
export function useReviews(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const url = `/api/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useApi(url);
}

export function useReview(id?: string) {
  return useApi(id ? `/api/reviews/${id}` : null);
}

export function useUpdateReviewStatus(id: string) {
  return useSWRMutation(`/api/reviews/${id}`, updateRequest);
}

export function useDeleteReview(id: string) {
  return useSWRMutation(`/api/reviews/${id}`, () =>
    deleteRequest(`/api/reviews/${id}`)
  );
}

// Audit Logs hooks
export function useAuditLogs(params?: {
  search?: string;
  level?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.level) queryParams.append("level", params.level);
  if (params?.resource) queryParams.append("resource", params.resource);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const url = `/api/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useApi(url);
}

export function useAuditLog(id?: string) {
  return useApi(id ? `/api/audit-logs/${id}` : null);
}

export function useDeleteAuditLog(id: string) {
  return useSWRMutation(`/api/audit-logs/${id}`, () =>
    deleteRequest(`/api/audit-logs/${id}`)
  );
}



// Analytics hooks
export function useAnalytics(period?: string) {
  const queryParams = new URLSearchParams();
  if (period) queryParams.append("period", period);

  const url = `/api/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useApi(url);
}

export function useSalesAnalytics(period?: string) {
  const queryParams = new URLSearchParams();
  if (period) queryParams.append("period", period);

  const url = `/api/analytics/sales${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useApi(url);
}

export function useDashboard() {
  return useApi("/api/dashboard");
}

export function useOrdersByStatus(status: string, page?: number, limit?: number) {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());
  
  const url = `/api/orders?status=${status}${queryParams.toString() ? `&${queryParams.toString()}` : ""}`;
  return useApi<{
    orders: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: string;
      totalAmount: number;
      status: string;
      paymentStatus: string;
      notes?: string | null;
      createdAt: string;
      updatedAt: string;
      userId?: string | null;
      user?: {
        id: string;
        email: string;
        name: string | null;
      } | null;
      orderItems: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        productId: string;
        product: {
          id: string;
          name: string;
          brand?: { name: string } | null;
          category?: { name: string } | null;
        };
      }>;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(url);
}
