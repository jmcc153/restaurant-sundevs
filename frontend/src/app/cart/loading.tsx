export default function CartLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-[80vh]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4"
            >
              <div className="h-20 w-20 bg-slate-200 rounded-xl animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse self-start" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="h-6 w-1/2 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between">
              <div className="h-5 w-12 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
