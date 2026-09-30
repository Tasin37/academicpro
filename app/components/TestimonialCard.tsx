type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
};

export default function TestimonialCard({ quote, name, role }: TestimonialCardProps) {
  return (
    <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm transition hover:shadow-lg">
      <p className="text-base leading-8 text-[#39484d]">“{quote}”</p>
      <div className="mt-6 border-t border-[#d9ddda] pt-5">
        <p className="font-semibold text-[#182329]">{name}</p>
        <p className="mt-1 text-sm text-[#647176]">{role}</p>
      </div>
    </div>
  );
}
