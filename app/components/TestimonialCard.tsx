type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  institution?: string;
  rating?: number;
};

export default function TestimonialCard({
  quote,
  name,
  role,
  institution,
  rating = 5,
}: TestimonialCardProps) {
  const stars = Math.min(5, Math.max(1, Math.round(rating)));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#d9ddda] bg-white p-7 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
      <div>
        {/* Star Rating & Verified Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-500" aria-label={`${stars} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <span key={starIndex} className="text-base">
                {starIndex <= stars ? "★" : "☆"}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            ✓ Verified
          </span>
        </div>

        {/* Quote */}
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#39484d]">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* Author info */}
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#182329] text-xs font-bold text-white shadow-xs">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-[#182329]">{name}</p>
          <p className="text-xs text-[#647176]">
            {role}
            {institution ? <span className="text-slate-400"> • {institution}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}
