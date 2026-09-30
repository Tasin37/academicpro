type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c94e39]">
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl ${dark ? "text-white" : "text-[#182329]"}`}>
        {title}
      </h2>
      <p className={`mt-4 text-base leading-8 ${dark ? "text-slate-300" : "text-[#647176]"}`}>{description}</p>
    </div>
  );
}
