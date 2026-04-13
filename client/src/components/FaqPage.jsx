import { useEffect, useRef, useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

// ── FAQ data by topic ──────────────────────────────────────────────────────

const TOPICS = [
  {
    id: "tests",
    label: "About Tests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    color: "#2563EB",
    faqs: [
      { q: "What tests are available on Lumea?", a: "Lumea covers SAT and IELTS preparation. For SAT we have 24 digital practice tests from March 2023 onwards, 8 BlueBook official tests, and 5 full mock tests. For IELTS we have 50 practice tests across all four skills (Listening, Reading, Writing, Speaking) and 5 full mock tests." },
      { q: "Are the practice tests the same format as the real exam?", a: "Yes. SAT tests follow the Digital SAT adaptive format (two modules per section). IELTS tests mirror the official Computer-Delivered IELTS structure with the same timing, question types, and scoring rubric." },
      { q: "Can I do a partial test — just Math or just Reading & Writing?", a: "For SAT practice tests you can launch Math-only or Reading & Writing-only sessions from the test card. IELTS tests are separated by skill, so you can practise each of the four skills independently." },
      { q: "How are my test results scored?", a: "SAT tests return a scaled score (200–800 per section, 400–1600 total) calculated using the official College Board conversion tables. IELTS tests return a band score (0–9) per skill and an overall average." },
      { q: "What is the BlueBook section?", a: "BlueBook is College Board's official free test-prep app. The 8 tests in that section link directly to the official content, giving you the most authentic SAT experience possible." },
      { q: "How often are new tests added?", a: "We add new SAT tests after every administration window (typically March, May, August, October, November). IELTS tests are updated quarterly." },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v2m0 8v2m-3-5h6m-6-3h6" />
      </svg>
    ),
    color: "#F59E0B",
    faqs: [
      { q: "What is included in the free Basic plan?", a: "Basic is completely free, forever — no credit card required. You get 1 SAT mock test, 1 IELTS mock test, 1 full lesson, 200 SAT Question Bank questions, and 10 IELTS practice tests." },
      { q: "What is the difference between Plus and Pro?", a: "Plus unlocks all practice tests, all mock tests, BlueBook tests, and the AI Score Push study planner. Pro adds unlimited question bank access, AI Speaking feedback, weekly live study sessions, and 1-on-1 personalised planning." },
      { q: "How much does the yearly plan save?", a: "Both Plus and Pro are 17% cheaper on the yearly plan compared to paying month-to-month. The 3-month plan saves 9%. Savings are shown live on the Pricing page as you switch billing periods." },
      { q: "Can I switch plans at any time?", a: "Yes. Upgrade or downgrade whenever you like — the change takes effect at the start of your next billing cycle and you keep access to your current tier until then." },
      { q: "What payment methods are accepted?", a: "We accept Visa, Mastercard, Click, and Payme for Uzbekistan residents. International cards are also supported." },
      { q: "Can I cancel and get a refund?", a: "You can cancel anytime from your account settings with no cancellation fee. Refunds for unused time are handled case-by-case — contact support within 7 days of a charge." },
    ],
  },
  {
    id: "results",
    label: "Results & Progress",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "#10B981",
    faqs: [
      { q: "How does the Score Push feature work?", a: "Enter your current section scores (or IELTS band scores) and your target exam date. The AI analyses your weaknesses, ranks them by impact, and generates a week-by-week study plan that fits the time you have left." },
      { q: "Are my results saved between sessions?", a: "Yes. All completed tests, scores, and progress data are saved to your account. You can review your history from the dashboard at any time." },
      { q: "Can I see which questions I got wrong?", a: "After submitting a test you can review every question with the correct answer, your answer, and a detailed explanation. Incorrect questions are also flagged in your question bank for quick revision." },
      { q: "How accurate is the predicted band / score?", a: "Predictions are based on official scoring tables and statistical models trained on historical score distributions. They are a close estimate — real exam conditions, nerves, and test-day variation will always have some effect." },
      { q: "Does my score improve if I retake the same test?", a: "Your most recent attempt is stored as the primary result, but all historical attempts are kept. We recommend using different test versions for a cleaner picture of real improvement." },
    ],
  },
  {
    id: "ai",
    label: "Artificial Intelligence",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
    color: "#8B5CF6",
    faqs: [
      { q: "What AI features does Lumea use?", a: "Lumea uses AI for three things: Score Push (personalised week-by-week study plan from your scores), Writing feedback (band-by-band annotation of your IELTS essays), and Speaking scoring (Pro plan — transcription and band estimation from your recorded responses)." },
      { q: "How does the AI generate my study plan?", a: "The planner takes your per-section scores, your target date, and historical data on which skill gaps respond fastest to focused practice. It weights your weakest areas highest in the first weeks, then shifts to maintenance and mock simulation as the exam approaches." },
      { q: "Is the AI Writing feedback as reliable as a human examiner?", a: "AI feedback is highly consistent and covers the four official IELTS criteria (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy). For final exam preparation, treat it as a high-frequency training tool and complement it with occasional human review." },
      { q: "Does the AI remember my previous attempts?", a: "Yes. The study plan adapts each time you run it — if you have improved in Reading since the last plan, it will shift focus accordingly. The more data you provide, the more tailored the recommendations become." },
      { q: "Will AI features improve over time?", a: "Yes. We continuously fine-tune our models against new exam data and user feedback. Pro users get early access to new AI features before they roll out to all plans." },
    ],
  },
];

// ── Utility ────────────────────────────────────────────────────────────────

function useVisible(threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Topic section ──────────────────────────────────────────────────────────

function TopicSection({ topic, index }) {
  const [sectionRef, visible] = useVisible(0.1);
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="faqTopic" ref={sectionRef} id={`faq-${topic.id}`}>
      <div className="faqTopicShell">
        {/* Header */}
        <div className={`faqTopicHeader${visible ? " faqTopicHeaderVisible" : ""}`} style={{ transitionDelay: "0ms" }}>
          <div className="faqTopicIconWrap" style={{ "--tc": topic.color }}>
            {topic.icon}
          </div>
          <div>
            <p className="landingSectionLabel" style={{ color: topic.color }}>Topic {index + 1}</p>
            <h2 className="faqTopicTitle">{topic.label}</h2>
          </div>
        </div>

        {/* Accordion list */}
        <div className="faqAccordionList">
          {topic.faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className={`faqAccordionItem${isOpen ? " faqAccordionItemOpen" : ""}${visible ? " faqAccordionItemVisible" : ""}`}
                style={{ transitionDelay: `${i * 60 + 80}ms` }}
              >
                <button
                  className="faqAccordionQ"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="faqAccordionQDot" style={{ background: topic.color }} />
                  <span className="faqAccordionQText">{faq.q}</span>
                  <svg className="faqAccordionChevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`faqAccordionBody${isOpen ? " faqAccordionBodyOpen" : ""}`}>
                  <div className="faqAccordionBodyInner">
                    <p className="faqAccordionA">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function FaqPage({ onLoginClick, onNavClick }) {
  const [activeTopic, setActiveTopic] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(`faq-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTopic(id);
  };

  return (
    <section className="faqPage">
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="faq" />

      {/* ── Hero ── */}
      <div className="faqHero" data-aos="fade-up">
        <span className="faqHeroBadge">Help Centre</span>
        <h1 className="faqHeroTitle">Frequently Asked Questions</h1>
        <p className="faqHeroSub">Everything you need to know about Lumea — tests, pricing, results, and AI features. Can't find your answer? Email us at <a className="faqHeroEmail" href="mailto:info@lumea.uz">info@lumea.uz</a></p>

        {/* Topic navigation pills */}
        <div className="faqTopicNav" role="navigation" aria-label="FAQ topics">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              className={`faqTopicNavBtn${activeTopic === t.id ? " faqTopicNavBtnActive" : ""}`}
              style={{ "--tc": t.color }}
              onClick={() => scrollTo(t.id)}
            >
              <span className="faqTopicNavIcon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Topic sections ── */}
      {TOPICS.map((topic, i) => (
        <TopicSection key={topic.id} topic={topic} index={i} />
      ))}

      <PublicFooter onLoginClick={onLoginClick} onNavClick={onNavClick} />
    </section>
  );
}
