import { useEffect, useRef, useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import PublicAtmosphere from "./PublicAtmosphere";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

// ── Topic icons (static, language-independent) ─────────────────────────────

const TOPIC_ICONS = {
  tests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  pricing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v2m0 8v2m-3-5h6m-6-3h6" />
    </svg>
  ),
  results: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  ),
};

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

function TopicSection({ topic, index, topicLabel }) {
  const [sectionRef, visible] = useVisible(0.1);
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="faqTopic" ref={sectionRef} id={`faq-${topic.id}`}>
      <div className="faqTopicShell">
        <div className={`faqTopicHeader${visible ? " faqTopicHeaderVisible" : ""}`} style={{ transitionDelay: "0ms" }}>
          <div className="faqTopicIconWrap" style={{ "--tc": topic.color }}>
            {TOPIC_ICONS[topic.id]}
          </div>
          <div>
            <p className="landingSectionLabel" style={{ color: topic.color }}>{topicLabel} {index + 1}</p>
            <h2 className="faqTopicTitle">{topic.label}</h2>
          </div>
        </div>

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

export default function FaqPage({ onLoginClick, onNavClick, currentTheme, onToggleTheme }) {
  const { lang } = useLanguage();
  const t = translations[lang].faq;

  const [activeTopic, setActiveTopic] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(`faq-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTopic(id);
  };

  return (
    <section className="faqPage">
      <PublicAtmosphere variant="faq" />
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="faq" currentTheme={currentTheme} onToggleTheme={onToggleTheme} />

      {/* ── Hero ── */}
      <div className="faqHero" data-aos="fade-up">
        <span className="faqHeroBadge">{t.badge}</span>
        <h1 className="faqHeroTitle">{t.heading}</h1>
        <p className="faqHeroSub">
          {t.sub}{" "}
          <a className="faqHeroEmail" href="mailto:info@lumea.uz">info@lumea.uz</a>
        </p>

        <div className="faqTopicNav" role="navigation" aria-label="FAQ topics">
          {t.topics.map((topic) => (
            <button
              key={topic.id}
              className={`faqTopicNavBtn${activeTopic === topic.id ? " faqTopicNavBtnActive" : ""}`}
              style={{ "--tc": topic.color }}
              onClick={() => scrollTo(topic.id)}
            >
              <span className="faqTopicNavIcon">{TOPIC_ICONS[topic.id]}</span>
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Topic sections ── */}
      {t.topics.map((topic, i) => (
        <TopicSection key={topic.id} topic={topic} index={i} topicLabel={t.topicLabel} />
      ))}

      <PublicFooter onLoginClick={onLoginClick} onNavClick={onNavClick} />
    </section>
  );
}
