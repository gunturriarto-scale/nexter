import { KolCreator, KolTrackedPost } from "@/lib/kol/types";
import { engagementRate } from "@/lib/kol/aggregate";
import { formatCompact, formatCurrency, formatDate, formatPercent, formatRoi } from "@/lib/kol/format";
import { Avatar, SyncStatusChip } from "@/app/kol/ui";
import { ViewsSparkline } from "@/app/kol/sparkline";

function PostCard({ post, creator }: { post: KolTrackedPost; creator: KolCreator | undefined }) {
  return (
    <div className="gfx-card gfx-card-hover flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-[#342d32]">{post.caption}</p>
        <SyncStatusChip status={post.syncStatus} />
      </div>
      <div className="flex items-center gap-2 text-xs text-[#9d8a97]">
        {creator && <Avatar seed={creator.avatarSeed} label={creator.displayName} size={20} />}
        <span className="truncate">{creator?.username ?? post.creatorId}</span>
        <a
          href={post.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 font-medium text-[#8154b6] underline hover:text-[#f0466d]"
        >
          Buka link
        </a>
      </div>

      {post.syncStatus === "ok" ? (
        <>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <div className="text-[#9d8a97]">Views</div>
              <div className="font-semibold text-[#342d32]">{formatCompact(post.views)}</div>
            </div>
            <div>
              <div className="text-[#9d8a97]">Likes</div>
              <div className="font-semibold text-[#342d32]">{formatCompact(post.likes)}</div>
            </div>
            <div>
              <div className="text-[#9d8a97]">Komentar</div>
              <div className="font-semibold text-[#342d32]">{formatCompact(post.comments)}</div>
            </div>
            <div>
              <div className="text-[#9d8a97]">Share</div>
              <div className="font-semibold text-[#342d32]">{formatCompact(post.shares)}</div>
            </div>
          </div>
          <div className="text-[11px] text-[#9d8a97]">Engagement rate: {formatPercent(engagementRate(post))}</div>
          <ViewsSparkline data={post.viewsTrend} />
          {post.linkedGmvMax ? (
            <p className="rounded-none bg-[#f5effb] px-2 py-1.5 text-[11px] font-medium text-[#8154b6]">
              Juga jalan di GMV Max: {formatCurrency(post.linkedGmvMax.cost)} cost · {formatRoi(post.linkedGmvMax.roi)} ROI ·{" "}
              {post.linkedGmvMax.orders} orders
            </p>
          ) : (
            <p className="text-[11px] text-[#a895a1]">Organik saja — belum diamplifikasi lewat GMV Max.</p>
          )}
        </>
      ) : (
        <p className="rounded-none bg-[#fdf0f3] px-2 py-3 text-center text-xs text-[#9d8a97]">
          {post.syncStatus === "private" && "Akun jadi private — pakai angka terakhir yang tersimpan."}
          {post.syncStatus === "not_found" && "Video sudah tidak bisa diakses (dihapus/di-takedown)."}
          {post.syncStatus === "error" && "Sync terakhir gagal — coba lagi nanti."}
        </p>
      )}
      <div className="text-[10px] text-[#a895a1]">
        Diposting {formatDate(post.postedAt)} · ditambahkan oleh {post.addedBy}
      </div>
    </div>
  );
}

export function TrackedPosts({ posts, creators }: { posts: KolTrackedPost[]; creators: KolCreator[] }) {
  const creatorById = new Map(creators.map((c) => [c.creatorId, c]));
  const sorted = [...posts].sort((a, b) => b.views - a.views);
  if (sorted.length === 0) {
    return <p className="text-sm text-[#9d8a97]">Belum ada tracked post untuk filter ini.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((post) => (
        <PostCard key={post.postId} post={post} creator={creatorById.get(post.creatorId)} />
      ))}
    </div>
  );
}
