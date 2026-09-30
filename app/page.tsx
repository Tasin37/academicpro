import SectionHeading from "./components/SectionHeading";
import ServiceCard from "./components/ServiceCard";
import StepCard from "./components/StepCard";
import TestimonialCard from "./components/TestimonialCard";
import FAQItem from "./components/FAQItem";

const services = [
  {
    icon: "01",
    title: "Expert Writers",
    description: "Academic professionals deliver essays, reports, and research papers with quality and precision.",
  },
  {
    icon: "02",
    title: "Fast Turnaround",
    description: "Submit your assignment details and get a polished draft before your deadline.",
  },
  {
    icon: "03",
    title: "Plagiarism-Free",
    description: "All work is original, carefully sourced, and thoroughly proofread for academic standards.",
  },
  {
    icon: "04",
    title: "24/7 Support",
    description: "Our team answers your questions and updates you through every stage of the project.",
  },
];

const steps = [
  {
    step: "1",
    title: "Share Your Requirements",
    description: "Tell us your topic, deadline, and grading rubric so we can match you with the right expert.",
  },
  {
    step: "2",
    title: "Get a Custom Plan",
    description: "Receive a detailed proposal, price estimate, and timeline for your assignment support.",
  },
  {
    step: "3",
    title: "Review and Submit",
    description: "Approve the final draft, request revisions, and download the finished assignment.",
  },
];

const testimonials = [
  {
    quote: "The team helped me turn a late assignment into an A-grade submission with clean research and formatting.",
    name: "Maya Johnson",
    role: "Undergraduate Student",
  },
  {
    quote: "Clear communication and fast delivery made the whole process stress-free during finals week.",
    name: "David Lee",
    role: "Graduate Researcher",
  },
];

const faqs = [
  {
    question: "How do I place an assignment order?",
    answer: "Simply fill out the order form with your course details, topic, deadline, and any attachment you want us to follow.",
  },
  {
    question: "Can I request revisions after delivery?",
    answer: "Yes, every order includes revision support until you are satisfied with the final paper.",
  },
  {
    question: "Is my personal information kept confidential?",
    answer: "Absolutely. We keep all details private and treat every order with strict confidentiality.",
  },
];

export default function Home() {
  return (
    <div className="page-grid text-[#182329]">
      <header className="sticky top-0 z-10 border-b border-[#d9ddda]/80 bg-[#f5f4f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a className="flex items-center gap-3 text-lg font-semibold tracking-tight text-[#182329]" href="#hero">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8664d] text-xs font-bold text-white">A</span>
            Academic<span className="text-[#e8664d]">Pro</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#647176] md:flex">
            <a href="#services" className="transition hover:text-[#e8664d]">
              Services
            </a>
            <a href="#why-us" className="transition hover:text-[#e8664d]">
              Why Us
            </a>
            <a href="#how-it-works" className="transition hover:text-[#e8664d]">
              Process
            </a>
            <a href="#faq" className="transition hover:text-[#e8664d]">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/auth" className="hidden text-sm font-semibold text-[#182329] transition hover:text-[#e8664d] sm:inline-flex">
              Sign in
            </a>
            <a
              href="/auth?mode=register"
              className="rounded-full bg-[#182329] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e8664d]"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="hero" className="relative overflow-hidden bg-[#182329] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-32">
          <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-36 border-[#e8664d]/20" />
          <div className="pointer-events-none absolute -bottom-48 left-1/3 h-96 w-96 rounded-full border border-white/10" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="reveal max-w-2xl">
              <p className="inline-flex border border-[#e8664d]/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#ffad9a]">
                Assignment help made simple
              </p>
              <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Expert academic support for every assignment.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#d6dfdf]">
                Fast, reliable, and plagiarism-free writing help tailored to college and university students.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#e8664d] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#f07860]"
                >
                  Get Started
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Our Services
                </a>
              </div>
            </div>
            <div className="reveal reveal-delay-2 float-slow border border-white/15 bg-white/5 p-2 backdrop-blur-xl sm:p-3">
              <div className="bg-[#f5f4f0] p-8 text-[#182329] shadow-2xl shadow-black/20 sm:p-10">
                <p className="text-sm uppercase tracking-[0.3em] text-[#c94e39]">Trusted by students</p>
                <p className="mt-6 text-3xl font-semibold">97% satisfaction rate</p>
                <p className="mt-3 text-[#647176]">Professional support for essays, projects, dissertations, and exams.</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-[#e8e7e1] p-5">
                    <p className="text-3xl font-semibold">24/7</p>
                    <p className="mt-2 text-sm text-slate-400">Support available anytime.</p>
                  </div>
                  <div className="bg-[#e8e7e1] p-5">
                    <p className="text-3xl font-semibold">100+</p>
                    <p className="mt-2 text-sm text-slate-400">Subjects covered by experts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="px-6 py-20 sm:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Services"
            title="Comprehensive assignment support"
            description="Choose the service that matches your coursework and enjoy expert help from start to finish."
          />
          <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </section>

        <section id="why-us" className="bg-[#182329] px-6 py-24 text-white sm:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="A smarter way to finish assignments"
            description="We combine academic expertise, fast delivery, and clear communication so you can meet every deadline with confidence."
            dark
          />
          <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="space-y-6 rounded-4xl bg-white/10 p-8 ring-1 ring-white/10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ffad9a]">Professional support</p>
                <h3 className="mt-4 text-3xl font-semibold">Work with seasoned academic writers.</h3>
                <p className="mt-4 max-w-xl leading-7 text-slate-200">
                  Every document is prepared by qualified specialists who follow your instructions and ensure academic standards.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/90 p-6">
                  <p className="text-xl font-semibold text-white">Custom research</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">Detailed sourcing and references for trusted academic quality.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-6">
                  <p className="text-xl font-semibold text-white">Guaranteed delivery</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">We deliver drafts on time, even for urgent deadlines.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/90 p-8">
                <p className="text-3xl font-semibold text-white">+10k</p>
                <p className="mt-3 text-sm text-slate-300">Assignments completed successfully.</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-8">
                <p className="text-3xl font-semibold text-white">4.9/5</p>
                <p className="mt-3 text-sm text-slate-300">Average customer satisfaction score.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-6 py-20 sm:px-10 lg:px-16">
          <SectionHeading
            eyebrow="How It Works"
            title="Three steps to complete academic support"
            description="Simple planning, professional execution, and a final review to ensure your work is ready to submit."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <StepCard key={step.title} step={step.step} title={step.title} description={step.description} />
            ))}
          </div>
        </section>

        <section className="bg-slate-100 px-6 py-20 sm:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Testimonials"
            title="Students trust AcademicPro"
            description="Real feedback from learners who achieved better grades and reduced stress with our support."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {testimonials.map((item) => (
              <TestimonialCard key={item.name} quote={item.quote} name={item.name} role={item.role} />
            ))}
          </div>
        </section>

        <section id="faq" className="px-6 py-20 sm:px-10 lg:px-16">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Get quick answers about deadlines, revisions, and the support process."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-[#303e43] bg-[#182329] px-6 py-16 text-slate-100 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ffad9a]">Ready to start?</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Get personalized academic help today.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Share your assignment brief and deadline, and our experts will take care of the rest.
            </p>
          </div>
          <a
            href="mailto:hello@academicpro.com"
            className="mt-8 inline-flex rounded-full bg-[#e8664d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f07860] lg:mt-0"
          >
            Contact Us
          </a>
        </div>
        <div className="mt-12 flex flex-col gap-6 border-t border-slate-800 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AcademicPro. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <a href="#services" className="transition hover:text-white">
              Services
            </a>
            <a href="#how-it-works" className="transition hover:text-white">
              Process
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
