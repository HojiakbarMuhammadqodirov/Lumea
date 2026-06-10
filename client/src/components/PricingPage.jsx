import { useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import PublicAtmosphere from "./PublicAtmosphere";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

// ── Pricing meta (non-translated) ────────────────────────────────────────────

const BILLING_KEYS = [
  { key: "monthly",   months: 1 },
  { key: "quarterly", months: 3 },
  { key: "yearly",    months: 12 },
];

const PLAN_META = [
  { id: "basic",  isFree: true,  highlight: false, badge: null,         ctaStyle: "ghost",   baseMonthly: 0,      discounts: {} },
  { id: "plus",   isFree: false, highlight: true,  badge: "mostPopular", ctaStyle: "primary", baseMonthly: 79990,  discounts: { monthly: 0, quarterly: 0.09, yearly: 0.17 } },
  { id: "pro",    isFree: false, highlight: false, badge: "fullAccess",  ctaStyle: "dark",    baseMonthly: 119990, discounts: { monthly: 0, quarterly: 0.09, yearly: 0.17 } },
];

function formatSum(n) {
  return n.toLocaleString("ru-RU") + " UZS";
}

function getPlanPrice(meta, billingKey) {
  if (meta.isFree) return { perMonth: 0, total: 0, saved: 0 };
  const months = BILLING_KEYS.find((b) => b.key === billingKey)?.months ?? 1;
  const disc = meta.discounts[billingKey] ?? 0;
  const perMonth = Math.round(meta.baseMonthly * (1 - disc));
  const total = perMonth * months;
  const saved = (meta.baseMonthly - perMonth) * months;
  return { perMonth, total, saved };
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PricingPage({ onLoginClick, onNavClick, onSelectPlan, currentTheme, onToggleTheme }) {
  const { lang } = useLanguage();
  const t = translations[lang].pricing;

  const [billingKey, setBillingKey] = useState("monthly");
  const handleCta = onSelectPlan ?? onLoginClick;

  const billingLabels = [
    { key: "monthly",   label: t.billing.monthly },
    { key: "quarterly", label: t.billing.quarterly },
    { key: "yearly",    label: t.billing.yearly },
  ];

  const months = BILLING_KEYS.find((b) => b.key === billingKey)?.months ?? 1;

  return (
    <section className="pricingPage">
      <PublicAtmosphere variant="pricing" />
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="pricing" currentTheme={currentTheme} onToggleTheme={onToggleTheme} />

      {/* ── Hero ── */}
      <div className="pricingHero" data-aos="fade-up">
        <span className="pricingHeroBadge">{t.badge}</span>
        <h1 className="pricingHeroTitle">{t.heading}</h1>
        <p className="pricingHeroSub">{t.sub}</p>

        {/* Billing toggle */}
        <div className="pricingBillingToggle" role="group" aria-label="Billing period">
          {billingLabels.map((b) => (
            <button
              key={b.key}
              className={`pricingBillingBtn${billingKey === b.key ? " pricingBillingBtnActive" : ""}`}
              onClick={() => setBillingKey(b.key)}
            >
              {b.label}
              {b.key === "quarterly" && <span className="pricingBillingDiscount">−9%</span>}
              {b.key === "yearly"    && <span className="pricingBillingDiscount">−17%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="pricingCards" data-aos="fade-up" data-aos-delay="80">
        {PLAN_META.map((meta, idx) => {
          const plan = t.plans[idx];
          const { perMonth, total, saved } = getPlanPrice(meta, billingKey);
          return (
            <div key={meta.id} className={`pricingCard${meta.highlight ? " pricingCardHighlight" : ""}`}>
              {meta.badge && (
                <div className={`pricingCardBadge${meta.highlight ? " pricingCardBadgeHighlight" : ""}`}>
                  {meta.badge === "mostPopular" ? t.mostPopular : t.fullAccess}
                </div>
              )}

              <div className="pricingCardHead">
                <span className="pricingCardName">{plan.name}</span>
                {meta.isFree ? (
                  <div className="pricingCardPrice">
                    <span className="pricingCardAmount">{t.free}</span>
                    <span className="pricingCardPeriod">{t.forever}</span>
                  </div>
                ) : (
                  <div className="pricingCardPrice">
                    <span className="pricingCardAmount">{formatSum(perMonth)}</span>
                    <span className="pricingCardPeriod">{t.perMonth}</span>
                  </div>
                )}
                {!meta.isFree && billingKey !== "monthly" && saved > 0 && (
                  <div className="pricingCardTotal">
                    {t.billed} {billingKey === "quarterly" ? t.billedEvery3 : t.billedYearly} —{" "}
                    <strong>{formatSum(total)}</strong>
                    <span className="pricingCardSaved"> · {t.save} {formatSum(saved)}</span>
                  </div>
                )}
                {meta.isFree && (
                  <div className="pricingCardTotal">{t.noCard}</div>
                )}
              </div>

              <ul className="pricingCardFeatures">
                {plan.features.map((f) => (
                  <li key={f} className="pricingCardFeature">
                    <svg className="pricingCheckIcon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10.5 8.5 15 16 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`pricingCardCta pricingCardCta--${meta.ctaStyle}`}
                onClick={handleCta}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <PublicFooter onLoginClick={onLoginClick} onNavClick={onNavClick} />
    </section>
  );
}
