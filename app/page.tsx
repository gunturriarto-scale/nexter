import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-4xl flex-col items-start justify-center gap-8 px-6 py-24">
      <div className="gfx-gradient-soft w-full rounded-none p-10 shadow-sm ring-1 ring-[#93C5FD]/40">
        <div className="inline-flex items-center gap-2 rounded-none bg-white/70 px-3 py-1 text-xs font-semibold text-[#0891B2] ring-1 ring-[#BFDBFE]">
          <span className="h-2 w-2 rounded-none bg-[#2563EB]" />
          TikTok commerce intelligence
        </div>
        <h1 className="mt-5 font-serif text-5xl font-semibold tracking-tight text-[#14213D]">
          HERMES{" "}
          <span className="gfx-text-gradient">— Data Analyst</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#4B5D78]">
          TikTok commerce intelligence buat GLOW FX: GMV Max ROI, creator affiliate, loss analysis,
          competitive benchmarking, dan trend discovery.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/gmv-max"
            className="gfx-btn"
          >
            Buka GMV Max Dashboard →
          </Link>
          <Link
            href="/creator"
            className="rounded-none border border-[#0891B2]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#0891B2] transition-colors hover:bg-[#EEF4FF]"
          >
            Buka Creator Dashboard →
          </Link>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "GMV Max", desc: "Cost, ROI, campaign & creative health dalam satu layar." },
          { title: "Creator", desc: "Affiliate creator, kolaborasi, dan performa konten." },
          { title: "Trends", desc: "Hashtag & sound naik daun buat arah konten." },
        ].map((f) => (
          <div key={f.title} className="gfx-card gfx-card-hover p-5">
            <div className="font-serif text-base font-semibold text-[#2563EB]">{f.title}</div>
            <p className="mt-1 text-[13px] text-[#4B5D78]">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
