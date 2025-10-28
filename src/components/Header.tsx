"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Camera,
  ChevronUpIcon,
  Mic,
  LogIn,
  UserPlus,
  ReceiptText,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { CartDrawer } from "./CartDrawer";
import { brandData } from "../lib/brands";
import { useCart } from "@/contexts/CartContext";
import SearchDropdown from "./SearchDropdown";

const categories = [
  { name: "All", href: "/", scrollTo: null, active: true },
  { name: "Computers", href: "/computers", scrollTo: "computers", active: false },
  { name: "Tablets", href: "/tablets", scrollTo: "tablets", active: false },
  { name: "Printers", href: "/printers", scrollTo: "printers", active: false },
  { name: "Routers", href: "/routers", scrollTo: "routers", active: false },
  { name: "Speakers", href: "/speakers", scrollTo: "speakers", active: false },
  { name: "Monitors", href: "/monitors", scrollTo: "monitors", active: false },
];

// Brand data with categories

interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { itemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    // Check if current path is a brand page
    if (pathname?.startsWith("/brands/")) {
      const brandSlug = pathname.split("/")[2]; // Get the brand from URL
      setActiveBrand(brandSlug);
    } else {
      setActiveBrand(null);
    }
  }, [pathname]);

  // Check for logged in user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Handle category click with smooth scrolling
  const handleCategoryClick = (e: React.MouseEvent, category: any) => {
    if (pathname === "/" && category.scrollTo) {
      e.preventDefault();
      const element = document.getElementById(category.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Handle category scroll from search dropdown
  const handleCategoryScroll = (categoryName: string) => {
    if (pathname === "/") {
      const categoryMap: { [key: string]: string } = {
        "Computers": "computers",
        "Printers": "printers",
        "Monitors": "monitors",
        "Speakers": "speakers",
        "Routers": "routers"
      };
      
      const scrollId = categoryMap[categoryName];
      if (scrollId) {
        const element = document.getElementById(scrollId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          setIsSearchOpen(false);
        }
      }
    }
  };

  // Get current category from pathname
  const getCurrentCategory = () => {
    if (pathname === "/") return "all";
    if (pathname?.startsWith("/computers")) return "computers";
    if (pathname?.startsWith("/phones")) return "phones";
    if (pathname?.startsWith("/printers")) return "printers";
    if (pathname?.startsWith("/routers")) return "routers";
    if (pathname?.startsWith("/speakers")) return "speakers";
    if (pathname?.startsWith("/ipads")) return "ipads";
    if (pathname?.startsWith("/monitors")) return "monitors";
    if (pathname?.startsWith("/accessories")) return "accessories";
    return "all";
  };

  const currentCategory = getCurrentCategory();

  // Filter brands based on current category
  const filteredBrandData =
    currentCategory === "all"
      ? brandData
      : brandData.filter((brand) => brand.categories.includes(currentCategory));

  // Map brands with active state
  const brands = filteredBrandData.map((brand) => ({
    ...brand,
    active: activeBrand === brand.href.split("/").pop(),
  }));

  // Map categories with active state based on pathname
  const activeCategories = categories.map((category) => ({
    ...category,
    active: pathname === category.href,
  }));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const categoriesRef = useRef(null);
  const brandsRef = useRef(null);
  const chevronRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    // Register GSAP for use
    gsap.registerPlugin();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || 0;
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastScrollYRef.current;
          // Always show when near top
          if (currentY < 10) {
            setIsHeaderVisible(true);
          } else if (delta > 5) {
            // Scrolling down
            setIsHeaderVisible(false);
          } else if (delta < -5) {
            // Scrolling up
            setIsHeaderVisible(true);
          }
          lastScrollYRef.current = currentY;
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleNavigation = () => {
    const timeline = gsap.timeline({
      onComplete: () => setIsNavigationVisible(!isNavigationVisible),
    });

    if (isNavigationVisible) {
      // Fold animation
      timeline
        .to([categoriesRef.current, brandsRef.current], {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        })
        .to(
          chevronRef.current,
          {
            rotation: 180,
            duration: 0.3,
            ease: "power2.inOut",
          },
          "<"
        );
    } else {
      // Unfold animation
      timeline
        .set([categoriesRef.current, brandsRef.current], {
          display: "block",
        })
        .to([categoriesRef.current, brandsRef.current], {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut",
        })
        .to(
          chevronRef.current,
          {
            rotation: 0,
            duration: 0.3,
            ease: "power2.inOut",
          },
          "<"
        );
    }
  };

  return (
    <>
      <header
        className={`bg-white shadow-sm sticky top-0 left-0 right-0 z-50 transition-transform duration-300 will-change-transform ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="md:hidden ">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <img src="/logo.png" alt="logo" className="size-8" />

              <Link href="/" className="text-xl font-bold">
                <span className="text-blue-600">KT</span>ComputerSupply
              </Link>

              <div className="flex items-center gap-2">
                {user ? (
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors overflow-hidden"
                    aria-label="Account"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-600">
                        {user.name?.charAt(0).toUpperCase() ||
                          user.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                    aria-label="Login"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 text-white bg-blue-500 text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    console.log("Mobile search input focused, opening dropdown");
                    console.log("Current searchQuery:", searchQuery);
                    setIsSearchOpen(true);
                    console.log("setIsSearchOpen(true) called");
                  }}
                  onBlur={() => {
                    console.log("Search input blurred, scheduling close");
                    // Delay closing to allow click events to process
                    setTimeout(() => {
                      console.log("Closing dropdown after delay");
                      setIsSearchOpen(false);
                    }, 200);
                  }}
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search for products..."
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                >
                  <Search className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                </button>
              </form>
              <SearchDropdown
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClose={() => setIsSearchOpen(false)}
                isOpen={isSearchOpen}
                onCategoryScroll={handleCategoryScroll}
              />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-2xl font-bold hover:text-blue-700 transition-colors flex items-center gap-2"
                >
                  <img src="/logo.png" alt="logo" className="size-8" />
                  <span className="text-blue-600">KT</span>ComputerSupply
                </Link>
              </div>

              <div className="flex flex-1 max-w-2xl mx-8">
                <div className="relative w-full">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        console.log("Desktop search input focused, opening dropdown");
                        console.log("Current searchQuery:", searchQuery);
                        setIsSearchOpen(true);
                        console.log("setIsSearchOpen(true) called");
                      }}
                      onBlur={() => {
                        console.log("Desktop search input blurred, scheduling close");
                        // Delay closing to allow click events to process
                        setTimeout(() => {
                          console.log("Closing desktop dropdown after delay");
                          setIsSearchOpen(false);
                        }, 200);
                      }}
                      className="block w-full pl-10 pr-12 py-2 border rounded-full border-gray-300 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      placeholder="Search for products..."
                    />
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-full transition-colors"
                    >
                      <Search className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                    </button>
                  </form>
                  <SearchDropdown
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onClose={() => setIsSearchOpen(false)}
                    isOpen={isSearchOpen}
                    onCategoryScroll={handleCategoryScroll}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  >
                    {user && user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : user ? (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase() ||
                          user.email.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && !user && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/auth/login"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Login</span>
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  )}

                  {/* Logged In Menu */}
                  {isUserMenuOpen && user && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ReceiptText className="h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={() => {
                          // Logout: clear localStorage and reset state
                          localStorage.removeItem("auth_token");
                          localStorage.removeItem("user");
                          setUser(null);
                          setIsUserMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Cart Button */}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories navigation */}
        <nav
          ref={categoriesRef}
          className="bg-gray-50 border-t border-gray-200 overflow-x-auto no-scrollbar"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-6 md:space-x-8 h-12">
              {activeCategories.map((category) => {
                const isActive = category.active;
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors focus:outline-none relative ${
                      isActive
                        ? "text-blue-600 font-semibold"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                    aria-label={`${category.name} category`}
                  >
                    {category.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Brand navigation */}
        <nav
          ref={brandsRef}
          className="bg-white border-t border-gray-200 pb-4 overflow-x-auto no-scrollbar"
          aria-label="Brands"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-3 md:space-x-4 h-12 items-center">
              {brands.map((brand) => {
                const isActive = brand.active;
                return (
                  <Link
                    key={brand.name}
                    href={brand.href}
                    id={brand.active ? "active-brand" : ""}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "hover:bg-blue-50"
                    }`}
                    aria-label={`${brand.name} products`}
                  >
                    <div className="relative w-5 h-5 mr-2">
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} brand logo - Shop ${brand.name} products at KT Computer Supply Rwanda`}
                        fill
                        sizes="24x24"
                        className="object-contain group-hover:text-blue-600 transition-colors"
                        loading="lazy"
                        quality={80}
                      />
                    </div>
                    <span>{brand.name}</span>
                    {isActive && (
                      <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/brands"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="View all brands"
              >
                More
              </Link>
            </div>
          </div>
        </nav>

        {/* Toggle button */}
        <div className="absolute justify-center items-center flex w-full -bottom-2.5">
          <button
            onClick={toggleNavigation}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            aria-label={
              isNavigationVisible ? "Collapse navigation" : "Expand navigation"
            }
          >
            <ChevronUpIcon
              ref={chevronRef}
              className="size-[22px] bg-gray-200 rounded-full opacity-60 hover:opacity-80 transition-opacity"
            />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-200 ease-in-out ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="fixed inset-0  bg-opacity-25" aria-hidden="true" />
          <nav
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl z-50"
            aria-label="Mobile menu"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <span className="text-lg font-medium text-gray-900">Menu</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-2 py-3 space-y-1 overflow-y-auto bg-white">
              {/* Mobile search */}
              <div className="px-4 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="Search for products..."
                    aria-label="Search"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Camera
                      className="h-5 w-5 text-gray-400 focus:text-gray-600"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile account and cart */}
              <div className="px-4 py-2 flex space-x-4">
                <Link
                  href="/account"
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <User className="h-5 w-5 mr-2" aria-hidden="true" />
                  Account
                </Link>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />
                  Cart ({itemCount})
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
