type StepCardProps = {
  step: string;
  title: string;
  description: string;
};

export default function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8664d] text-lg font-semibold text-white">
        {step}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[#182329]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#647176]">{description}</p>
    </div>
  );
}
