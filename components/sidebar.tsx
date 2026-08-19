"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    title: "Analytics",
    items: [
      { href: "/gmv-max", label: "GMV Max", description: "ROI, campaign, creative" },
      { href: "/kol", label: "KOL", description: "Kreator, kolaborasi, tracked posts" },
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
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[#f0e4e9] bg-white">
      <Link href="/" className="border-b border-[#f0e4e9] px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-none gfx-gradient text-sm font-bold text-white">
            G
          </span>
          <div>
            <div className="font-serif text-base font-semibold tracking-tight text-[#342d32]">
              HERMES
            </div>
            <div className="text-xs font-medium text-[#8154b6]">GLOW FX Data Analyst</div>
          </div>
        </div>
      </Link>
      <nav className="flex flex-col gap-1.5 p-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            <div className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#a895a1]">
              {section.title}
            </div>
            <div className="flex flex-col gap-1.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group rounded-none px-3 py-2.5 transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#f0466d]/12 to-[#8154b6]/12 shadow-sm ring-1 ring-[#f6a7bc]/40"
                        : "text-[#6b5a66] hover:bg-[#fdf0f3] hover:text-[#342d32]"
                    }`}
                  >
                    <div className={`text-sm font-semibold ${active ? "text-[#f0466d]" : ""}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${active ? "text-[#8154b6]" : "text-[#a895a1]"}`}>
                      {item.description}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto border-t border-[#f0e4e9] p-4">
        <div className="rounded-none gfx-gradient-soft p-3 text-xs text-[#6b5a66]">
          <div className="font-semibold text-[#f0466d]">Glow FX Beauty</div>
          <div className="mt-0.5">TikTok commerce intelligence</div>
        </div>
      </div>
    </aside>
  );
}
