export default function OrderLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Stepper skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Order details skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Timeline skeleton */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
