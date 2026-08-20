export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const next = params.next || "/";
  const hasError = params.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f2f3] px-4">
      <div className="gfx-card w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-none gfx-gradient text-sm font-bold text-white">
            G
          </span>
          <div>
            <div className="font-serif text-lg font-semibold tracking-tight text-[#342d32]">HERMES</div>
            <div className="text-xs font-medium text-[#8154b6]">GLOW FX Data Analyst</div>
          </div>
        </div>

        <h1 className="font-serif text-xl font-semibold text-[#342d32]">Staging Access</h1>
        <p className="mt-1 text-sm text-[#9d8a97]">Masuk buat lanjut ke dashboard.</p>

        {hasError && (
          <div className="mt-4 rounded-none border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
            Email atau password salah.
          </div>
        )}

        <form action="/api/login" method="POST" className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col text-sm text-[#6b5a66]">
            Email
            <input type="email" name="email" required autoFocus className="gfx-input mt-1" />
          </label>
          <label className="flex flex-col text-sm text-[#6b5a66]">
            Password
            <input type="password" name="password" required className="gfx-input mt-1" />
          </label>
          <button type="submit" className="gfx-btn mt-2">
            Masuk
          </button>
        </form>
      </div>
    </main>
  );
}
