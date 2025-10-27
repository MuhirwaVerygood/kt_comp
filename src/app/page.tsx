import Header from "@/components/Header";
import EpicHeroSection from "@/components/EpicHeroSection";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import Link from "next/link";
import { ArrowRight, Award, Truck, Users } from "lucide-react";
import { BrandMarquee } from "@/components/BrandMarquee";
import { prisma } from "@/lib/prisma";
import Footer from "@/components/Footer";
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema, FAQSchema } from "@/components/SEO/StructuredData";

async function getProductsByCategory(categorySlug: string, limit: number = 8) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return [];

    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products;
  } catch (error) {
    console.error(`Error fetching ${categorySlug} products:`, error);
    return [];
  }
}

export default async function Page() {
  // Fetch products for each category in parallel with caching
  const [computers, phones, printers, routers, speakers, monitors] =
    await Promise.all([
      getProductsByCategory("computers", 8),
      getProductsByCategory("phones", 8),
      getProductsByCategory("printers", 8),
      getProductsByCategory("routers", 8),
      getProductsByCategory("speakers", 8),
      getProductsByCategory("monitors", 8),
    ]);

  // Add cache control headers for better performance
  const headers = new Headers();
  headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return (
    <main itemScope itemType="https://schema.org/Store">
      <OrganizationSchema
        name="KT Computer Supply"
        url="https://ktcomputersupply.vercel.rw"
        logo="https://ktcomputersupply.vercel.rw/logo.png"
        description="Premium electronics and computer solutions provider in Rwanda"
        address={{
          streetAddress: "Kigali, Rwanda",
          addressLocality: "Kigali",
          addressCountry: "RW",
        }}
        contactPoint={{
          telephone: "+250-XXX-XXX-XXX",
          contactType: "customer service",
        }}
      />
      <WebsiteSchema
        name="KT Computer Supply"
        url="https://ktcomputersupply.vercel.rw"
        description="Premium electronics and computer solutions in Rwanda"
        searchUrl="https://ktcomputersupply.vercel.rw/search"
      />
      <LocalBusinessSchema
        name="KT Computer Supply"
        url="https://ktcomputersupply.vercel.rw"
        description="Your trusted source for premium electronics, computers, and tech solutions in Rwanda. We offer high-quality products, expert service, and competitive prices with fast delivery across Kigali and Rwanda."
        address={{
          streetAddress: "Kigali, Rwanda",
          addressLocality: "Kigali",
          addressRegion: "Kigali",
          postalCode: "00000",
          addressCountry: "RW",
        }}
        geo={{
          latitude: -1.9441,
          longitude: 30.0619,
        }}
        telephone="+250-XXX-XXX-XXX"
        email="info@ktcomputersupply.rw"
        openingHours={[
          "Mo-Fr 08:00-18:00",
          "Sa 09:00-16:00",
        ]}
        priceRange="$$"
        image="https://ktcomputersupply.vercel.rw/logo.png"
      />
      <FAQSchema
        questions={[
          {
            question: "Do you offer warranty on your products?",
            answer: "Yes, all our products come with manufacturer warranty. We also provide additional 6-month warranty on most electronics.",
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept mobile money payments (MTN Mobile Money, Airtel Money), bank transfers, and PayPack payments.",
          },
          {
            question: "Do you deliver across Rwanda?",
            answer: "Yes, we deliver to all locations across Rwanda. Delivery times vary from 1-3 business days depending on your location.",
          },
          {
            question: "Can I return or exchange products?",
            answer: "Yes, we offer a 30-day return policy. Items must be in original condition with all accessories and packaging.",
          },
          {
            question: "Do you provide technical support?",
            answer: "Yes, our technical team provides free support for all products purchased from us. Contact us for assistance.",
          },
        ]}
      />
      <Header />

      {/* Epic Hero Section */}
      <EpicHeroSection />

      {/* Brand Marquee */}
      <BrandMarquee />

      {/* Computers Section */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-32"
        id="computers"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" itemProp="name">
              <Link href="/computers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Computers & Laptops
              </Link>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Premium laptops and desktops from top brands like Dell, HP, Lenovo, and Apple. Perfect for work, gaming, and everyday computing needs in Rwanda.
            </p>
          </div>
          <Link
            href="/computers"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
          >
            Shop Computers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {computers.length > 0 ? (
          <FeaturedProductsCarousel products={computers} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No computers available at the moment.
            </p>
          </div>
        )}
      </section>

      {/* Phones Section */}
      {/* <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900"
        id="phones"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Smartphones
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest phones from leading manufacturers
            </p>
          </div>
          <Link
            href="/phones"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {phones.length > 0 ? (
          <FeaturedProductsCarousel products={phones} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No phones available at the moment.
            </p>
          </div>
        )}
      </div> */}

      {/* Printers Section */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-32"
        id="printers"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" itemProp="name">
              <Link href="/printers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Printers
              </Link>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Professional printing solutions for home and office from Epson, HP, Canon, and more. Laser, inkjet, and multifunction printers with warranty and support in Rwanda.
            </p>
          </div>
          <Link
            href="/printers"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
          >
            Shop Printers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {printers.length > 0 ? (
          <FeaturedProductsCarousel products={printers} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No printers available at the moment.
            </p>
          </div>
        )}
      </section>

      {/* Routers Section */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900 scroll-mt-32"
        id="routers"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" itemProp="name">
              <Link href="/routers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Routers & Networking
              </Link>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              High-speed WiFi routers and mesh systems from TP-Link, Netgear, and Mercusys. Reliable networking solutions for home and business use in Rwanda.
            </p>
          </div>
          <Link
            href="/routers"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
          >
            Shop Routers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {routers.length > 0 ? (
          <FeaturedProductsCarousel products={routers} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No routers available at the moment.
            </p>
          </div>
        )}
      </section>

      {/* Speakers Section */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-32"
        id="speakers"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" itemProp="name">
              <Link href="/speakers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Speakers & Audio
              </Link>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Premium sound systems and portable speakers from Sonos, JBL, Marshall, and Bose. High-quality audio solutions for home entertainment and professional use in Rwanda.
            </p>
          </div>
          <Link
            href="/speakers"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
          >
            Shop Speakers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {speakers.length > 0 ? (
          <FeaturedProductsCarousel products={speakers} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No speakers available at the moment.
            </p>
          </div>
        )}
      </section>

      {/* Monitors Section */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900 scroll-mt-32"
        id="monitors"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" itemProp="name">
              <Link href="/monitors" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Monitors & Displays
              </Link>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              High-resolution monitors for work and gaming from ASUS, Dell, LG, and Samsung. 4K, QHD, and Full HD displays with excellent color accuracy and fast refresh rates.
            </p>
          </div>
          <Link
            href="/monitors"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
          >
            Shop Monitors
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {monitors.length > 0 ? (
          <FeaturedProductsCarousel products={monitors} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No monitors available at the moment.
            </p>
          </div>
        )}
      </section>
    
      <Footer />
    </main>
  );
}

// Add Next.js export for static optimization
export const dynamic = 'force-static';
export const revalidate = 300; // Revalidate every 5 minutes
