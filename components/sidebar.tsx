"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    title: "Analytics",
    items: [
      { href: "/gmv-max", label: "GMV Max", description: "ROI, campaign, creative" },
      { href: "/creator", label: "Creator", description: "Affiliate, kolaborasi, dan konten" },
      { href: "/loss", label: "Loss Analysis", description: "Cancellation & refund" },
    ],
  },
  {
    title: "LIVE Commerce",
    items: [
      { href: "/live-gmv-max", label: "LIVE GMV Max", description: "Livestream ads & live session" },
    ],
  },
  {
    title: "Market",
    items: [
      { href: "/market-intel", label: "Market Intelligence", description: "Glow FX vs kompetitor skincare" },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { href: "/shopee", label: "Shopee", description: "Order, produk, ads & retur" },
    ],
  },
  {
    title: "Setup",
    items: [
      { href: "/creator/admin", label: "Affiliate Data", description: "Input mapping tim (mockup)" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const navItems = NAV_SECTIONS.flatMap((section) => section.items);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#d9e3ee] bg-white md:hidden">
        <Link href="/" className="flex items-center gap-2 px-4 py-3">
          <span className="gfx-gradient flex h-7 w-7 items-center justify-center rounded-[2px] text-xs font-extrabold text-white">H</span>
          <div><div className="text-sm font-extrabold tracking-tight text-[#14213D]">HERMES</div><div className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#0891B2]">GLOW FX Data Analyst</div></div>
        </Link>
        <nav className="flex gap-1 overflow-x-auto border-t border-[#EEF2F6] px-3 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return <Link key={item.href} href={item.href} className={`shrink-0 rounded-[2px] px-3 py-1.5 text-[10px] font-bold ${active ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#71839B]"}`}>{item.label}</Link>;
          })}
        </nav>
      </header>

      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-[#d9e3ee] bg-white md:flex">
      <Link href="/" className="border-b border-[#d9e3ee] px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="gfx-gradient flex h-7 w-7 items-center justify-center rounded-[2px] text-xs font-extrabold text-white">
            H
          </span>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-[#14213D]">
              HERMES
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#0891B2]">GLOW FX Data Analyst</div>
          </div>
        </div>
      </Link>
      <nav className="flex flex-col gap-1 overflow-y-auto p-2.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-1.5">
            <div className="px-2.5 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#91A0B5]">
              {section.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group rounded-[2px] border-l-2 px-2.5 py-2 transition-colors ${
                      active
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-transparent text-[#4B5D78] hover:bg-[#f6f9fc] hover:text-[#14213D]"
                    }`}
                  >
                    <div className={`text-[11px] font-bold ${active ? "text-[#2563EB]" : ""}`}>
                      {item.label}
                    </div>
                    <div className={`mt-0.5 text-[9px] ${active ? "text-[#0891B2]" : "text-[#91A0B5]"}`}>
                      {item.description}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto border-t border-[#d9e3ee] p-3">
        <div className="gfx-gradient-soft rounded-[2px] border border-[#dce8f3] p-2.5 text-[9px] text-[#4B5D78]">
          <div className="font-bold text-[#2563EB]">Glow FX Beauty</div>
          <div className="mt-0.5">Commerce intelligence</div>
        </div>
      </div>
      </aside>
    </>
  );
}
