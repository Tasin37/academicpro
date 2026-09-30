type ServiceCardProps = {
  icon: string;
  title: string;
  description: string;
};

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="group border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-[0_1px_0_rgba(24,35,41,0.04)] transition duration-300 hover:-translate-y-2 hover:border-[#e8664d]/50 hover:shadow-xl hover:shadow-[#182329]/8">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#182329] text-xs font-semibold tracking-widest text-[#ffad9a] transition group-hover:bg-[#e8664d] group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-[#182329]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#647176]">{description}</p>
    </div>
  );
}
