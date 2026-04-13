import { useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

// ── Pricing data ───────────────────────────────────────────────────────────

const BILLING = [
  { key: "monthly",   label: "Monthly",   months: 1 },
  { key: "quarterly", label: "3-Month",   months: 3 },
  { key: "yearly",    label: "Yearly",    months: 12 },
];

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    badge: null,
    isFree: true,
    highlight: false,
    cta: "Get Started Free",
    ctaStyle: "ghost",
    features: [
      { text: "1 SAT mock test" },
      { text: "1 IELTS mock test" },
      { text: "1 full lesson access" },
      { text: "200 SAT Question Bank questions" },
      { text: "10 IELTS practice tests" },
      { text: "Community support" },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    badge: "Most Popular",
    isFree: false,
    baseMonthly: 79990,
    discounts: { monthly: 0, quarterly: 0.09, yearly: 0.17 },
    highlight: true,
    cta: "Start Plus",
    ctaStyle: "primary",
    features: [
      { text: "Everything in Basic" },
      { text: "All 24 SAT practice tests" },
      { text: "All 50 IELTS practice tests" },
      { text: "5 full mock tests (SAT + IELTS)" },
      { text: "All 8 BlueBook official tests" },
      { text: "AI Score Push & weekly study plan" },
      { text: "Progress tracking dashboard" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Full Access",
    isFree: false,
    baseMonthly: 119990,
    discounts: { monthly: 0, quarterly: 0.09, yearly: 0.17 },
    highlight: false,
    cta: "Start Pro",
    ctaStyle: "dark",
    features: [
      { text: "Everything in Plus" },
      { text: "Unlimited question bank" },
      { text: "AI Speaking feedback & scoring" },
      { text: "Weekly live study sessions" },
      { text: "Personalized 1-on-1 study plan" },
      { text: "Advanced performance analytics" },
      { text: "Priority support" },
    ],
  },
];

function formatSum(n) {
  return n.toLocaleString("ru-RU") + " UZS";
}

function getPlanPrice(plan, billing) {
  if (plan.isFree) return { perMonth: 0, total: 0, saved: 0 };
  const disc = plan.discounts[billing.key] ?? 0;
  const perMonth = Math.round(plan.baseMonthly * (1 - disc));
  const total = perMonth * billing.months;
  const saved = (plan.baseMonthly - perMonth) * billing.months;
  return { perMonth, total, saved };
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PricingPage({ onLoginClick, onNavClick, onSelectPlan }) {
  const [billing, setBilling] = useState(BILLING[0]);
  // onSelectPlan is passed when shown post-registration; otherwise use onLoginClick
  const handleCta = onSelectPlan ?? onLoginClick;

  return (
    <section className="pricingPage">
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="pricing" />

      {/* ── Hero ── */}
      <div className="pricingHero" data-aos="fade-up">
        <span className="pricingHeroBadge">Pricing</span>
        <h1 className="pricingHeroTitle">Simple, honest pricing.</h1>
        <p className="pricingHeroSub">Choose the plan that fits your preparation. Upgrade or cancel any time.</p>

        {/* Billing toggle */}
        <div className="pricingBillingToggle" role="group" aria-label="Billing period">
          {BILLING.map((b) => (
            <button
              key={b.key}
              className={`pricingBillingBtn${billing.key === b.key ? " pricingBillingBtnActive" : ""}`}
              onClick={() => setBilling(b)}
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
        {PLANS.map((plan) => {
          const { perMonth, total, saved } = getPlanPrice(plan, billing);
          return (
            <div key={plan.id} className={`pricingCard${plan.highlight ? " pricingCardHighlight" : ""}`}>
              {plan.badge && (
                <div className={`pricingCardBadge${plan.highlight ? " pricingCardBadgeHighlight" : ""}`}>
                  {plan.badge}
                </div>
              )}

              <div className="pricingCardHead">
                <span className="pricingCardName">{plan.name}</span>
                {plan.isFree ? (
                  <div className="pricingCardPrice">
                    <span className="pricingCardAmount">Free</span>
                    <span className="pricingCardPeriod">forever</span>
                  </div>
                ) : (
                  <div className="pricingCardPrice">
                    <span className="pricingCardAmount">{formatSum(perMonth)}</span>
                    <span className="pricingCardPeriod">/ month</span>
                  </div>
                )}
                {!plan.isFree && billing.key !== "monthly" && saved > 0 && (
                  <div className="pricingCardTotal">
                    Billed {billing.key === "quarterly" ? "every 3 months" : "yearly"} —{" "}
                    <strong>{formatSum(total)}</strong>
                    <span className="pricingCardSaved"> · Save {formatSum(saved)}</span>
                  </div>
                )}
                {plan.isFree && (
                  <div className="pricingCardTotal">No credit card required</div>
                )}
              </div>

              <ul className="pricingCardFeatures">
                {plan.features.map((f) => (
                  <li key={f.text} className="pricingCardFeature">
                    <svg className="pricingCheckIcon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10.5 8.5 15 16 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f.text}
                  </li>
                ))}
              </ul>

              <button
                className={`pricingCardCta pricingCardCta--${plan.ctaStyle}`}
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
