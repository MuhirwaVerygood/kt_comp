"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Clock, TrendingUp, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  inStock: boolean;
  stockCount: number;
  brand: { name: string };
  category: { name: string };
}

interface SearchDropdownProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  isOpen: boolean;
  onCategoryScroll?: (categoryName: string) => void;
}

export default function SearchDropdown({
  searchQuery,
  onSearchChange,
  onClose,
  isOpen,
  onCategoryScroll,
}: SearchDropdownProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search products when query changes
  useEffect(() => {
    console.log("useEffect triggered, searchQuery:", searchQuery, "length:", searchQuery.length);
    if (searchQuery.length >= 2) {
      console.log("Calling searchProducts");
      searchProducts(searchQuery);
    } else {
      console.log("Clearing products");
      setProducts([]);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const searchProducts = async (query: string) => {
    console.log("searchProducts called with query:", query);
    setLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
      console.log("API response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("API response data:", data);
        const products = data.success ? (data.data?.products || data.products || []) : [];
        setProducts(products);
        console.log("Products set:", products.length, "products");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      
      // Navigate to search page
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  console.log("SearchDropdown render, isOpen:", isOpen, "searchQuery:", searchQuery, "products length:", products.length);
  console.log("Products data:", products);
  if (!isOpen) {
    console.log("Dropdown not open, returning null");
    return null;
  }
  console.log("Dropdown is open, rendering...");

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Products</h3>
            {products.length > 0 && (
              <button
                onClick={() => handleSearch(searchQuery)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all results
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-2">
              {products.map((product) => {
                console.log("Rendering product in dropdown:", product.id, product.name);
                return (
                <div
                  key={product.id}
                  onMouseEnter={() => {
                    // Prefetch the product page on hover for instant navigation
                    router.prefetch(`/products/${product.id}`);
                  }}
                  onMouseDown={(e) => {
                    console.log("=== PRODUCT MOUSEDOWN START ===");
                    console.log("Product ID:", product.id);
                    console.log("Product Name:", product.name);
                    console.log("Target URL:", `/products/${product.id}`);

                    // Prevent input blur
                    e.preventDefault();

                    // Set loading state
                    setNavigating(product.id);

                    console.log("Attempting router.push...");
                    try {
                      router.push(`/products/${product.id}`);
                      console.log("Router.push successful");
                    } catch (error) {
                      console.error("Router.push failed:", error);
                      setNavigating(null);
                    }

                    console.log("Calling onClose...");
                    onClose();
                    console.log("onClose called");
                    console.log("=== PRODUCT MOUSEDOWN END ===");
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors w-full text-left cursor-pointer ${
                    navigating === product.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder-product.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.brand.name} • {product.category.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        product.inStock 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {product.inStock ? `${product.stockCount} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {navigating === product.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-gray-900">
                          RWF {product.price.toLocaleString()}
                        </div>
                        {!product.inStock && (
                          <div className="text-xs text-red-600 mt-1">
                            Unavailable
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No products found</p>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Search for "{searchQuery}"
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Searches */}
      {searchQuery.length < 2 && recentSearches.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Searches
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  onSearchChange(search);
                  handleSearch(search);
                }}
                className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      {searchQuery.length < 2 && (
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Available Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Computers", "Printers", "Monitors", "Speakers", "Routers"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  if (onCategoryScroll) {
                    onCategoryScroll(term);
                  } else {
                    onSearchChange(term);
                    handleSearch(term);
                  }
                }}
                className="px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}