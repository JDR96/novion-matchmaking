"use client";

export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="skeleton mb-2 h-4 w-40" />
          <div className="skeleton mb-3 h-3 w-56" />
          <div className="skeleton mb-3 h-2 w-full rounded-full" />
          <div className="flex gap-1.5">
            <div className="skeleton h-5 w-16 rounded-md" />
            <div className="skeleton h-5 w-20 rounded-md" />
            <div className="skeleton h-5 w-14 rounded-md" />
          </div>
          <div className="skeleton mt-2.5 h-3 w-full" />
        </div>
      </div>
    </div>
  );
}
