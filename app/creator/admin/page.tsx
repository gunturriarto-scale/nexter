"use client";

import { useMemo, useState } from "react";
import {
  MOCK_AFFILIATE_CAMPAIGNS,
  MOCK_AFFILIATE_PICS,
  MOCK_AFFILIATE_PROFILES,
  MOCK_COMPETITIONS,
  MOCK_CREATOR_LEVEL_SNAPSHOTS,
} from "@/lib/kol/affiliate-mock-data";
import { EditableGrid, TagsInput, type GridRow } from "@/app/creator/admin/editable-grid";

const TABS = [
  { key: "pic", label: "PIC / AM" },
  { key: "creators", label: "Creators & Mapping" },
  { key: "aliases", label: "Alias" },
  { key: "tags", label: "Tag vocab" },
  { key: "campaigns", label: "Campaign" },
  { key: "competitions", label: "Kompetisi" },
  { key: "levels", label: "Creator Level" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const LEVEL_OPTIONS = ["Lv. 1", "Lv. 2", "Lv. 3", "Lv. 4", "Lv. 5"].map((l) => ({ value: l, label: l }));
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "ENDED", label: "ENDED" },
];
const COMPETITION_TYPES = ["MONTHLY_COMPETITION", "QUARTERLY_REWARD", "DOUBLE_DATE", "PAYDAY"];

interface Competition {
  competitionId: string;
  name: string;
  type: string;
  campaignId: string;
  startDate: string;
  endDate: string;
  participantCreatorIds: string[];
  requiredHashtags: string[];
  minimumHashtagMatches: number;
}

export default function AffiliateAdminPage() {
  const [tab, setTab] = useState<TabKey>("pic");
  const [showJson, setShowJson] = useState(false);

  const [pics, setPics] = useState<GridRow[]>(() =>
    MOCK_AFFILIATE_PICS.map((p) => ({ name: p.name, picId: p.picId, avatarSeed: p.avatarSeed }))
  );
  const [creators, setCreators] = useState<GridRow[]>(() =>
    MOCK_AFFILIATE_PROFILES.map((c) => ({
      displayName: c.displayName,
      username: c.username,
      followerCount: c.followerCount,
      pic: c.pic,
      tags: c.tags,
      creatorId: c.creatorId,
    }))
  );
  const [aliases, setAliases] = useState<GridRow[]>(() =>
    MOCK_AFFILIATE_PROFILES.flatMap((c) => c.usernameAliases.map((alias) => ({ creatorId: c.creatorId, alias })))
  );
  const [tagVocab, setTagVocab] = useState<string[]>(() =>
    Array.from(new Set(MOCK_AFFILIATE_PROFILES.flatMap((c) => c.tags))).sort()
  );
  const [campaigns, setCampaigns] = useState<GridRow[]>(() =>
    MOCK_AFFILIATE_CAMPAIGNS.map((c) => ({
      name: c.name,
      campaignId: c.campaignId,
      status: c.status,
      requiredHashtags: c.requiredHashtags,
      minimumHashtagMatches: c.minimumHashtagMatches,
    }))
  );
  const [competitions, setCompetitions] = useState<Competition[]>(() =>
    MOCK_COMPETITIONS.map((c) => ({
      competitionId: c.competitionId,
      name: c.name,
      type: c.type,
      campaignId: c.campaignId,
      startDate: c.startDate,
      endDate: c.endDate,
      participantCreatorIds: [...c.participantCreatorIds],
      requiredHashtags: [...c.requiredHashtags],
      minimumHashtagMatches: c.minimumHashtagMatches,
    }))
  );
  const [levels, setLevels] = useState<GridRow[]>(() =>
    MOCK_CREATOR_LEVEL_SNAPSHOTS.map((s) => ({ creatorId: s.creatorId, effectiveMonth: s.effectiveMonth, level: s.level }))
  );

  const picOptions = useMemo(
    () => pics.filter((p) => p.picId).map((p) => ({ value: String(p.picId), label: `${p.name} (${p.picId})` })),
    [pics]
  );
  const creatorOptions = useMemo(
    () => creators.filter((c) => c.creatorId).map((c) => ({ value: String(c.creatorId), label: `${c.displayName} · ${c.username}` })),
    [creators]
  );
  const campaignOptions = useMemo(
    () => campaigns.filter((c) => c.campaignId).map((c) => ({ value: String(c.campaignId), label: c.name ? String(c.name) : String(c.campaignId) })),
    [campaigns]
  );
  const tagOptions = useMemo(() => tagVocab.map((t) => ({ value: t, label: t })), [tagVocab]);

  const jsonForTab: Record<TabKey, unknown> = {
    pic: pics.map((p) => ({ picId: p.picId, name: p.name, avatarSeed: p.avatarSeed })),
    creators: creators.map((c) => ({
      creatorId: c.creatorId,
      username: c.username,
      displayName: c.displayName,
      followerCount: Number(c.followerCount) || 0,
      pic: c.pic,
      tags: c.tags,
    })),
    aliases: aliases.map((a) => ({ creatorId: a.creatorId, alias: a.alias })),
    tags: tagVocab,
    campaigns: campaigns.map((c) => ({
      campaignId: c.campaignId,
      name: c.name,
      status: c.status,
      requiredHashtags: c.requiredHashtags,
      minimumHashtagMatches: Number(c.minimumHashtagMatches) || 0,
    })),
    competitions,
    levels: levels.map((l) => ({ creatorId: l.creatorId, effectiveMonth: l.effectiveMonth, level: l.level, source: "TIKTOK_MARKETPLACE_FILTER" })),
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6">
      <div className="border-b border-[#D9E3EE] pb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="gfx-chip bg-[#FEF3C7] text-[#92400E]">MOCKUP · BELUM TERSIMPAN</span>
          <span className="gfx-chip bg-[#DBEAFE] text-[#1D4ED8]">INTERNAL DATA ENTRY</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#14213D]">Affiliate — Input Data Internal</h1>
        <p className="mt-1 max-w-3xl text-[11px] text-[#7A8AA3]">
          Form buat tim affiliate ngisi data yang nggak dateng dari API TikTok: roster PIC, mapping creator ke PIC,
          alias handle, tag, campaign, kompetisi, dan Creator Level bulanan. Referensi lengkap:{" "}
          <code className="rounded-none bg-[#EFF6FF] px-1 text-[#0891B2]">docs/affiliate-manual-data.md</code>. Ini
          preview — perubahan belum disimpan ke mana-mana.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-[#DDE6F0]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setShowJson(false);
            }}
            className={`-mb-px rounded-none px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border border-b-0 border-[#DDE6F0] bg-white text-[#2563EB]"
                : "text-[#7A8AA3] hover:bg-[#EFF6FF] hover:text-[#14213D]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[11px] text-[#7A8AA3]">{TAB_HINT[tab]}</p>
        <button
          type="button"
          className="rounded-none border border-[#CDD9E6] px-3 py-1.5 text-[11px] font-semibold text-[#536984] hover:border-[#2563EB] hover:text-[#2563EB]"
          onClick={() => setShowJson((v) => !v)}
        >
          {showJson ? "Sembunyikan JSON" : "Lihat JSON"}
        </button>
      </div>

      {showJson && (
        <textarea
          readOnly
          className="gfx-input mt-3 h-56 w-full font-mono !text-[11px] leading-4"
          value={JSON.stringify(jsonForTab[tab], null, 2)}
        />
      )}

      <div className="mt-4">
        {tab === "pic" && (
          <EditableGrid
            fields={[
              { key: "name", label: "Nama AM", placeholder: "Sissy" },
              { key: "picId", label: "picId", placeholder: "pic-sissy", width: "w-[200px]" },
              { key: "avatarSeed", label: "avatarSeed", placeholder: "sissy", width: "w-[200px]" },
            ]}
            rows={pics}
            onChange={setPics}
            makeBlankRow={() => ({ name: "", picId: "", avatarSeed: "" })}
            addLabel="+ Tambah AM"
          />
        )}

        {tab === "creators" && (
          <EditableGrid
            fields={[
              { key: "displayName", label: "Display name", placeholder: "Kulit Sehat ID" },
              { key: "username", label: "Username (@handle)", placeholder: "@kulitsehat.id", width: "w-[200px]" },
              { key: "followerCount", label: "Followers", type: "number", width: "w-[120px]" },
              { key: "pic", label: "PIC", type: "select", options: picOptions, width: "w-[190px]" },
              { key: "tags", label: "Tags", type: "tags", width: "w-[260px]" },
              { key: "creatorId", label: "creatorId", placeholder: "creator-sissy-0", width: "w-[190px]" },
            ]}
            rows={creators}
            onChange={setCreators}
            makeBlankRow={() => ({ displayName: "", username: "", followerCount: "", pic: "", tags: [], creatorId: "" })}
            addLabel="+ Tambah creator"
          />
        )}

        {tab === "aliases" && (
          <EditableGrid
            fields={[
              { key: "creatorId", label: "Creator", type: "select", options: creatorOptions, width: "w-[320px]" },
              { key: "alias", label: "Alias username (@handle)", placeholder: "@kulitsehat.glow" },
            ]}
            rows={aliases}
            onChange={setAliases}
            makeBlankRow={() => ({ creatorId: "", alias: "" })}
            addLabel="+ Tambah alias"
            emptyLabel="Belum ada alias. Tambah tiap ada banner “Data quality” di dashboard."
          />
        )}

        {tab === "tags" && (
          <div className="gfx-card max-w-xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Tag vocabulary</div>
            <p className="gfx-section-desc mt-1">Daftar tag yang boleh dipakai di tab Creators. Ketik lalu Enter.</p>
            <div className="mt-3">
              <TagsInput value={tagVocab} onChange={setTagVocab} placeholder="tambah tag" />
            </div>
            {tagOptions.length === 0 && <p className="mt-2 text-[11px] text-[#7A8AA3]">Belum ada tag.</p>}
          </div>
        )}

        {tab === "campaigns" && (
          <EditableGrid
            fields={[
              { key: "name", label: "Nama campaign", placeholder: "Glow Bomb Always-on" },
              { key: "campaignId", label: "campaignId", placeholder: "campaign-glowbomb", width: "w-[200px]" },
              { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS, width: "w-[130px]" },
              { key: "requiredHashtags", label: "Required hashtags", type: "tags", width: "w-[360px]" },
              { key: "minimumHashtagMatches", label: "Min. match", type: "number", width: "w-[110px]" },
            ]}
            rows={campaigns}
            onChange={setCampaigns}
            makeBlankRow={() => ({ name: "", campaignId: "", status: "ACTIVE", requiredHashtags: [], minimumHashtagMatches: 3 })}
            addLabel="+ Tambah campaign"
          />
        )}

        {tab === "competitions" && (
          <CompetitionSection
            competitions={competitions}
            onChange={setCompetitions}
            campaignOptions={campaignOptions}
            creators={creators}
          />
        )}

        {tab === "levels" && (
          <EditableGrid
            fields={[
              { key: "creatorId", label: "Creator", type: "select", options: creatorOptions, width: "w-[320px]" },
              { key: "effectiveMonth", label: "Bulan (YYYY-MM)", placeholder: "2026-08", width: "w-[160px]" },
              { key: "level", label: "Level", type: "select", options: LEVEL_OPTIONS, width: "w-[130px]" },
            ]}
            rows={levels}
            onChange={setLevels}
            makeBlankRow={() => ({ creatorId: "", effectiveMonth: "", level: "Lv. 1" })}
            addLabel="+ Tambah snapshot"
          />
        )}
      </div>

      <footer className="mt-10 border-t border-[#D9E3EE] py-5 text-[10px] leading-4 text-[#7A8AA3]">
        Mockup — data di-seed dari dataset dummy dashboard, perubahan tidak disimpan. Tahap berikutnya: tabel
        Supabase + simpan via server action + join dengan data API di dashboard.
      </footer>
    </main>
  );
}

const TAB_HINT: Record<TabKey, string> = {
  pic: "Roster affiliate manager. picId dipakai sebagai kunci di tab Creators.",
  creators: "Roster creator + mapping ke PIC + tag. Satu creator = satu PIC.",
  aliases: "Handle lama / varian per creator, buat resolusi identity map.",
  tags: "Kosakata tag internal yang dipakai di tab Creators.",
  campaigns: "Definisi campaign + aturan hashtag buat validasi video.",
  competitions: "Setup kompetisi: tipe, periode, peserta, aturan hashtag.",
  levels: "Snapshot Creator Level bulanan (export dari TikTok Creator Marketplace).",
};

function CompetitionSection({
  competitions,
  onChange,
  campaignOptions,
  creators,
}: {
  competitions: Competition[];
  onChange: (next: Competition[]) => void;
  campaignOptions: { value: string; label: string }[];
  creators: GridRow[];
}) {
  const [selected, setSelected] = useState(0);
  const current = competitions[selected];

  function patch(fields: Partial<Competition>) {
    onChange(competitions.map((c, i) => (i === selected ? { ...c, ...fields } : c)));
  }
  function addCompetition() {
    onChange([
      ...competitions,
      {
        competitionId: "",
        name: "",
        type: "MONTHLY_COMPETITION",
        campaignId: "",
        startDate: "",
        endDate: "",
        participantCreatorIds: [],
        requiredHashtags: [],
        minimumHashtagMatches: 3,
      },
    ]);
    setSelected(competitions.length);
  }
  function removeCurrent() {
    onChange(competitions.filter((_, i) => i !== selected));
    setSelected((s) => Math.max(0, s - 1));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="gfx-card p-2">
        <ul className="space-y-1">
          {competitions.map((c, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                className={`w-full rounded-none px-3 py-2 text-left text-[11px] font-semibold ${
                  i === selected ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#536984] hover:bg-[#F5F8FC]"
                }`}
              >
                {c.name || "(tanpa nama)"}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-2 w-full rounded-none border border-[#CDD9E6] px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] hover:border-[#2563EB]"
          onClick={addCompetition}
        >
          + Tambah kompetisi
        </button>
      </aside>

      {current ? (
        <div className="gfx-card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Labeled label="Nama">
              <input className="gfx-input mt-1 !text-[11px]" value={current.name} onChange={(e) => patch({ name: e.target.value })} placeholder="August Affiliate Sprint" />
            </Labeled>
            <Labeled label="competitionId">
              <input className="gfx-input mt-1 !text-[11px]" value={current.competitionId} onChange={(e) => patch({ competitionId: e.target.value })} placeholder="comp-august" />
            </Labeled>
            <Labeled label="Tipe">
              <select className="gfx-select mt-1 !text-[11px]" value={current.type} onChange={(e) => patch({ type: e.target.value })}>
                {COMPETITION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Campaign induk">
              <select className="gfx-select mt-1 !text-[11px]" value={current.campaignId} onChange={(e) => patch({ campaignId: e.target.value })}>
                <option value="">—</option>
                {campaignOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Mulai (YYYY-MM-DD)">
              <input className="gfx-input mt-1 !text-[11px]" value={current.startDate} onChange={(e) => patch({ startDate: e.target.value })} placeholder="2026-08-01" />
            </Labeled>
            <Labeled label="Selesai (YYYY-MM-DD)">
              <input className="gfx-input mt-1 !text-[11px]" value={current.endDate} onChange={(e) => patch({ endDate: e.target.value })} placeholder="2026-08-28" />
            </Labeled>
            <Labeled label="Min. hashtag match">
              <input
                type="number"
                className="gfx-input mt-1 !w-[110px] !text-[11px]"
                value={current.minimumHashtagMatches}
                onChange={(e) => patch({ minimumHashtagMatches: Number(e.target.value) || 0 })}
              />
            </Labeled>
            <Labeled label="Required hashtags">
              <div className="mt-1">
                <TagsInput value={current.requiredHashtags} onChange={(next) => patch({ requiredHashtags: next })} placeholder="#GlowFX" />
              </div>
            </Labeled>
          </div>

          <div className="mt-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#91A0B5]">
              Peserta ({current.participantCreatorIds.length})
            </div>
            <div className="mt-2 grid max-h-56 grid-cols-1 gap-1 overflow-y-auto border border-[#E8EEF5] p-2 sm:grid-cols-2">
              {creators.filter((c) => c.creatorId).length === 0 && (
                <span className="text-[11px] text-[#7A8AA3]">Isi tab Creators dulu.</span>
              )}
              {creators
                .filter((c) => c.creatorId)
                .map((c) => {
                  const id = String(c.creatorId);
                  const checked = current.participantCreatorIds.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-2 text-[11px] text-[#4B5D78]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          patch({
                            participantCreatorIds: e.target.checked
                              ? [...current.participantCreatorIds, id]
                              : current.participantCreatorIds.filter((x) => x !== id),
                          })
                        }
                      />
                      {c.displayName} · {c.username}
                    </label>
                  );
                })}
            </div>
          </div>

          <button
            type="button"
            className="mt-4 rounded-none border border-[#CDD9E6] px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:border-rose-400"
            onClick={removeCurrent}
          >
            Hapus kompetisi ini
          </button>
        </div>
      ) : (
        <div className="gfx-card p-4 text-[11px] text-[#7A8AA3]">Belum ada kompetisi. Klik “+ Tambah kompetisi”.</div>
      )}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">
      {label}
      {children}
    </label>
  );
}
