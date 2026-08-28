"use client";

import { useMemo, useState } from "react";
import {
  MOCK_AFFILIATE_CAMPAIGNS,
  MOCK_AFFILIATE_PICS,
  MOCK_AFFILIATE_PROFILES,
  MOCK_COMPETITIONS,
} from "@/lib/kol/affiliate-mock-data";
import { EditableGrid, TagsInput, type GridRow } from "@/app/creator/admin/editable-grid";

const TABS = [
  { key: "pic", label: "PIC / AM" },
  { key: "creators", label: "Creators & Mapping" },
  { key: "campaigns", label: "Campaign" },
  { key: "competitions", label: "Kompetisi" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

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

function titleFromHandle(username: string): string {
  return username
    .replace(/^@/, "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugId(username: string): string {
  return "creator-" + username.replace(/^@/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function parseBulk(text: string): { username: string; displayName: string; creatorId: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [handlePart, ...rest] = line.split(/[,\t|]/);
      let username = handlePart.trim();
      if (username && !username.startsWith("@")) username = "@" + username;
      const displayName = rest.join(" ").trim() || titleFromHandle(username);
      return { username, displayName, creatorId: slugId(username) };
    })
    .filter((row) => row.username.length > 1);
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
      pic: c.pic,
      creatorId: c.creatorId,
    }))
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

  // bulk-assign state for the Creators tab
  const [bulkPic, setBulkPic] = useState<string>(MOCK_AFFILIATE_PICS[0]?.picId ?? "");
  const [bulkText, setBulkText] = useState("");

  const picOptions = useMemo(
    () => pics.filter((p) => p.picId).map((p) => ({ value: String(p.picId), label: `${p.name} (${p.picId})` })),
    [pics]
  );
  const campaignOptions = useMemo(
    () => campaigns.filter((c) => c.campaignId).map((c) => ({ value: String(c.campaignId), label: c.name ? String(c.name) : String(c.campaignId) })),
    [campaigns]
  );

  function addBulk() {
    const parsed = parseBulk(bulkText);
    if (parsed.length === 0 || !bulkPic) return;
    const existing = new Set(creators.map((c) => String(c.username).toLowerCase()));
    const fresh = parsed
      .filter((row) => !existing.has(row.username.toLowerCase()))
      .map((row) => ({ displayName: row.displayName, username: row.username, pic: bulkPic, creatorId: row.creatorId }));
    setCreators([...creators, ...fresh]);
    setBulkText("");
  }

  const jsonForTab: Record<TabKey, unknown> = {
    pic: pics.map((p) => ({ picId: p.picId, name: p.name, avatarSeed: p.avatarSeed })),
    creators: creators.map((c) => ({ creatorId: c.creatorId, username: c.username, displayName: c.displayName, pic: c.pic })),
    campaigns: campaigns.map((c) => ({
      campaignId: c.campaignId,
      name: c.name,
      status: c.status,
      requiredHashtags: c.requiredHashtags,
      minimumHashtagMatches: Number(c.minimumHashtagMatches) || 0,
    })),
    competitions,
  };

  const bulkPicName = pics.find((p) => p.picId === bulkPic)?.name ?? "PIC";

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
          campaign, dan kompetisi. Referensi lengkap:{" "}
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
          <div className="space-y-5">
            <div className="gfx-card p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Bulk assign</div>
              <p className="gfx-section-desc mt-1">
                Pilih PIC, terus tempel daftar creator-nya (satu per baris). Format: <code>@handle</code> atau{" "}
                <code>@handle, Nama Tampilan</code>. Handle yang udah kemapping bakal dilewati.
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">
                  PIC / AM
                  <select className="gfx-select mt-1 !text-[11px]" value={bulkPic} onChange={(e) => setBulkPic(e.target.value)}>
                    {picOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <textarea
                className="gfx-input mt-3 h-40 w-full font-mono !text-[11px] leading-5"
                placeholder={"@kulitsehat.id, Kulit Sehat ID\n@dermaid.review\n@glow.by.tia, Glow by Tia"}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button
                type="button"
                className="gfx-btn mt-3"
                onClick={addBulk}
                disabled={!bulkText.trim() || !bulkPic}
              >
                + Tambah ke {bulkPicName}
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                  Semua mapping ({creators.length})
                </div>
                <p className="text-[10px] text-[#7A8AA3]">Ganti PIC lewat dropdown, hapus lewat ×.</p>
              </div>
              <EditableGrid
                fields={[
                  { key: "displayName", label: "Display name", placeholder: "Kulit Sehat ID" },
                  { key: "username", label: "Username (@handle)", placeholder: "@kulitsehat.id", width: "w-[220px]" },
                  { key: "pic", label: "PIC", type: "select", options: picOptions, width: "w-[210px]" },
                  { key: "creatorId", label: "creatorId", placeholder: "auto", width: "w-[210px]" },
                ]}
                rows={creators}
                onChange={setCreators}
                makeBlankRow={() => ({ displayName: "", username: "", pic: bulkPic, creatorId: "" })}
                addLabel="+ Tambah satu creator"
              />
            </div>
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
  creators: "Roster creator + mapping ke PIC. Satu creator = satu PIC.",
  campaigns: "Definisi campaign + aturan hashtag buat validasi video.",
  competitions: "Setup kompetisi: tipe, periode, peserta, aturan hashtag.",
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
