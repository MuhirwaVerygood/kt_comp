"use client";

import { Facebook, Instagram, Linkedin, Youtube, Twitter, InstagramIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const data = {
  facebookLink: "https://facebook.com/kt_computer_supply",
  instaLink: "https://instagram.com/kt_computer_supply",
  twitterLink: "https://twitter.com/kt_computer_supply",
  linkedinLink: "https://linkedin.com/company/kt_computer_supply",
  youtubeLink: "https://youtube.com/@kt_computer_supply",
  company: {
    home: "/",
    contact: "/contact",
    about: "/about",
    getStarted: "/products",
  },
  categories: {
    computers: "/computers",
    phones: "/phones",
    printers: "/printers",
    monitors: "/monitors",
  },
  account: {
    profile: "/account",
    myAccount: "/account",
    preferences: "/account/settings",
    purchase: "/account/orders",
  },
  support: {
    faqs: "/faqs",
    shipping: "/shipping",
    returns: "/returns",
    warranty: "/warranty",
  },
  companyInfo: {
    name: "KT Computer Supply",
    logo: "/logo-white.png",
  },
};

const socialLinks = [
  {
    icon: <InstagramIcon />,
    label: "Instagram",
    href: data.instaLink,
    color: "bg-pink-600",
  },
];

const companyLinks = [
  { text: "Home", href: data.company.home },
  { text: "Contact us", href: data.company.contact },
  { text: "About us", href: data.company.about },
  { text: "Get started", href: data.company.getStarted },
];

const categoryLinks = [
  { text: "Computers", href: data.categories.computers },
  { text: "Phones", href: data.categories.phones },
  { text: "Printers", href: data.categories.printers },
  { text: "Monitors", href: data.categories.monitors },
];

const accountLinks = [
  { text: "Profile", href: data.account.profile },
  { text: "My account", href: data.account.myAccount },
  { text: "Preferences", href: data.account.preferences },
  { text: "Purchase", href: data.account.purchase },
];

const usefulLinks = [
  { text: "Our Shop", href: "/products" },
  { text: "Services", href: "/services" },
  { text: "News", href: "/news" },
  { text: "Contact", href: "/contact" },
];

const supportLinks = [
  { text: "FAQs", href: data.support.faqs },
  { text: "Refund", href: data.support.returns },
  { text: "Privacy Policy", href: "/privacy" },
  { text: "Report", href: "/report" },
  { text: "DMCA", href: "/dmca" },
];

const informationLinks = [
  { text: "About Us", href: "/about" },
  { text: "Our Services", href: "/services" },
  { text: "Pricing Plan", href: "/pricing" },
  { text: "Vendor Shop", href: "/vendors" },
  { text: "Affiliate", href: "/affiliate" },
  { text: "Stores", href: "/stores" },
];

const servicesLinks = [
  { text: "Products", href: "/products" },
  { text: "Payment", href: "/payment" },
  { text: "Discount", href: "/discount" },
  { text: "Promotional", href: "/promo" },
  { text: "Gifts", href: "/gifts" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="w-full mt-[50px]">
      <div className="min-w-full mx-auto relative bg-[#1a0b3e] px-[10%]">
        {/* Newsletter Section */}

        {/* <div className="bg-[#0B1A2D] rounded-[32px] px-8 md:px-12 py-10 mb-8 w-[90%] absolute right-0 left-0 -top-24 mx-auto z-50">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Our <span className="text-[#3B9EFF]">Newsletter</span>
              </h2>
              <p className="text-gray-400 text-sm">
                Get updates by subscribe our weekly newsletter
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="relative w-full md:w-auto"
            >
              <div className="relative flex items-center bg-[#1a2942] rounded-full overflow-hidden w-full md:w-[420px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email ..."
                  className="flex-1 px-6 py-3.5 bg-transparent text-white placeholder:text-gray-500 border-none outline-none text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#3B9EFF] hover:bg-[#2B8EEF] text-white font-semibold rounded-full transition-colors whitespace-nowrap m-1"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div> */}

        {/* Main Footer Content */}
        <div className=" px-8 md:px-12 py-10 -mt-[50px] -z-10 pt-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {/* Company Info Column */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <img
                  src={data.companyInfo.logo}
                  alt={data.companyInfo.name}
                  width={100}
                  height={100}
                />
                <span className="text-xl font-sans font-bold text-white">
                  {data.companyInfo.name}.
                </span>
              </Link>
              <div className="space-y-1 text-sm text-white/70">
                <p className="font-semibold -gray-700 mb-2">Our Address:</p>
                <p className="font-semibold -[#0B1A2D]">KG 549 St, Kigali,</p>
                <p className="font-semibold -[#0B1A2D]">Rwanda</p>
                <p className="mt-4 mb-1">
                  <span className="font-semibold -gray-700">24/7 Free Call:</span>
                </p>
                <p className="font-bold -[#0B1A2D]">+250 788 123 456</p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map(({ icon, href, label, color }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    className={`w-9 h-9 ${color} text-white rounded-lg flex items-center justify-center transition-colors shadow-sm hover:opacity-80`}
                  >
                    {icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="text-base font-bold text-white mb-5">Useful Links</h3>
              <ul className="space-y-2.5">
                {usefulLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="text-white/70 hover:text-[#3B9EFF] transition-colors text-sm flex items-center gap-1.5"
                    >
                      <span className="text-white/70 text-base">›</span>
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-base font-bold text-white mb-5">Support</h3>
              <ul className="space-y-2.5">
                {supportLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="text-white/70 hover:text-[#3B9EFF] transition-colors text-sm flex items-center gap-1.5"
                    >
                      <span className="text-white/70 text-base">›</span>
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-base font-bold text-white mb-5">Services</h3>
              <ul className="space-y-2.5">
                {servicesLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="text-white/70 hover:text-[#3B9EFF] transition-colors text-sm flex items-center gap-1.5"
                    >
                      <span className="text-white/70 text-base">›</span>
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Map */}
            <div>
              <h3 className="text-base font-bold text-white mb-5">Our Location</h3>
              <div className="w-full h-[200px] overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!3m2!1sen!2srw!4v1761233685624!5m2!1sen!2srw!6m8!1m7!1sJtIJyV-i_U30zf35aq61JQ!2m2!1d-1.946320957571322!2d30.05986903665121!3f217.0100586884753!4f19.073266932088387!5f0.7820865974627469"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a0b3e] pt-6 pb-3 flex flex-col md:flex-row items-center px-10 justify-between gap-4">
          <p className="text-sm text-gray-500">
            Gadgets Shop © 2025 All Rights Reserved.
          </p>
          <div className="flex items-center gap-3">
            <img
              src="/cards.png"
              alt="Credit card images"
              width={300}
              height={50}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
