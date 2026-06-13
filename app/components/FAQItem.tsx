type FAQItemProps = {
  question: string;
  answer: string;
};

export default function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <details className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-slate-950">
        {question}
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition group-open:bg-sky-600 group-open:text-white">
          Answer
        </span>
      </summary>
      <p className="mt-4 text-sm leading-7 text-slate-600">{answer}</p>
    </details>
  );
}
