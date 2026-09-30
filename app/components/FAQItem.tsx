type FAQItemProps = {
  question: string;
  answer: string;
};

export default function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <details className="group border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm transition open:border-[#e8664d]/50 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#182329]">
        {question}
        <span className="shrink-0 rounded-full bg-[#e8e7e1] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#647176] transition group-open:bg-[#e8664d] group-open:text-white">
          +
        </span>
      </summary>
      <p className="mt-4 text-sm leading-7 text-[#647176]">{answer}</p>
    </details>
  );
}
