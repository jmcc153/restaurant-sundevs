export default function Loading() {
  return (
    <main className="container mx-auto py-8">
      <div className="h-10 w-56 bg-slate-200 rounded-lg animate-pulse mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="h-48 bg-slate-200 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
