import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-4xl flex-col items-start justify-center gap-8 px-6 py-24">
      <div className="gfx-gradient-soft w-full rounded-none p-10 shadow-sm ring-1 ring-[#f6a7bc]/40">
        <div className="inline-flex items-center gap-2 rounded-none bg-white/70 px-3 py-1 text-xs font-semibold text-[#8154b6] ring-1 ring-[#c4c2f2]">
          <span className="h-2 w-2 rounded-none bg-[#f0466d]" />
          TikTok commerce intelligence
        </div>
        <h1 className="mt-5 font-serif text-5xl font-semibold tracking-tight text-[#342d32]">
          HERMES{" "}
          <span className="gfx-text-gradient">— Data Analyst</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6b5a66]">
          TikTok commerce intelligence buat GLOW FX: GMV Max ROI, manajemen KOL, loss analysis,
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
            href="/kol"
            className="rounded-none border border-[#8154b6]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#8154b6] transition-colors hover:bg-[#f5effb]"
          >
            Buka KOL Dashboard →
          </Link>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "GMV Max", desc: "Cost, ROI, campaign & creative health dalam satu layar." },
          { title: "KOL", desc: "Roster kreator, kolaborasi, dan performa tracked posts." },
          { title: "Trends", desc: "Hashtag & sound naik daun buat arah konten." },
        ].map((f) => (
          <div key={f.title} className="gfx-card gfx-card-hover p-5">
            <div className="font-serif text-base font-semibold text-[#f0466d]">{f.title}</div>
            <p className="mt-1 text-[13px] text-[#6b5a66]">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
