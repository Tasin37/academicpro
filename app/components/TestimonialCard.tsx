type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
};

export default function TestimonialCard({ quote, name, role }: TestimonialCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-base leading-8 text-slate-700">“{quote}”</p>
      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="font-semibold text-slate-950">{name}</p>
        <p className="mt-1 text-sm text-slate-600">{role}</p>
      </div>
    </div>
  );
}
