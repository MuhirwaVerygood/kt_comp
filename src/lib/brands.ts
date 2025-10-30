// Database brands data
interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  products: Array<{
    name: string;
    category: string;
  }>;
}

interface Category {
  name: string;
  slug: string;
  productCount: number;
  brandSlugs: string[];
}

// Transform database brands to header format
export function transformBrandsData(brands: Brand[], categories: Category[]) {
  return brands
    .filter(brand => brand.productCount > 0)
    .map(brand => {
      const brandCategories = categories
        .filter(cat => cat.brandSlugs.includes(brand.slug))
        .map(cat => cat.slug);
      
      return {
        name: brand.name,
        href: `/brands/${brand.slug}`,
        logo: `/brands/${brand.slug}.png`,
        categories: brandCategories,
      };
    });
}

// Updated brand data based on database
export const brandData = [
  {
    name: "Apple",
    href: "/brands/apple",
    logo: "/brands/apple.png",
    categories: ["computers", "tablets"],
  },
  {
    name: "Asus",
    href: "/brands/asus",
    logo: "/brands/asus.png",
    categories: ["routers"],
  },
  {
    name: "BenQ",
    href: "/brands/benq",
    logo: "/brands/benq.png",
    categories: ["monitors"],
  },
  {
    name: "Bose",
    href: "/brands/bose",
    logo: "/brands/bose.png",
    categories: ["speakers"],
  },
  {
    name: "Brother",
    href: "/brands/brother",
    logo: "/brands/brother.png",
    categories: ["printers"],
  },
  {
    name: "Canon",
    href: "/brands/canon",
    logo: "/brands/canon.png",
    categories: ["printers"],
  },
  {
    name: "Dell",
    href: "/brands/dell",
    logo: "/brands/dell.png",
    categories: ["computers", "monitors"],
  },
  {
    name: "HP",
    href: "/brands/hp",
    logo: "/brands/hp.png",
    categories: ["printers"],
  },
  {
    name: "JBL",
    href: "/brands/jbl",
    logo: "/brands/jbl.png",
    categories: ["speakers"],
  },
  {
    name: "LG",
    href: "/brands/lg",
    logo: "/brands/lg.png",
    categories: ["monitors"],
  },
  {
    name: "Lenovo",
    href: "/brands/lenovo",
    logo: "/brands/lenovo.png",
    categories: ["computers"],
  },
  {
    name: "Modio",
    href: "/brands/modio",
    logo: "/brands/modio.png",
    categories: ["tablets"],
  },
  {
    name: "Samsung",
    href: "/brands/samsung",
    logo: "/brands/samsung.png",
    categories: ["monitors"],
  },
  {
    name: "Sony",
    href: "/brands/sony",
    logo: "/brands/sony.png",
    categories: ["speakers"],
  },
  {
    name: "TP-Link",
    href: "/brands/tp-link",
    logo: "/brands/tp-link.png",
    categories: ["routers"],
  },
  {
    name: "Xerox",
    href: "/brands/xerox",
    logo: "/brands/xerox.png",
    categories: ["printers"],
  },
];