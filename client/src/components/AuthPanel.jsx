import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  englishLevel: "",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function OrDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#e2e6ef" }} />
      <span style={{ fontSize: 13, color: "#9aacbf", fontWeight: 500 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#e2e6ef" }} />
    </div>
  );
}

export default function AuthPanel({ onLogin, onRegister, onAlert, defaultRegister = false }) {
  const { lang } = useLanguage();
  const t = translations[lang].auth;

  const [isRegister, setIsRegister] = useState(defaultRegister);
  const [step, setStep] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [form, setForm] = useState(initial);

  const upd = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validateStep0 = () => {
    const v = t.validation;
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword || !form.phoneNumber) {
      return v.step0Required;
    }
    if (form.password !== form.confirmPassword) return v.passwordMismatch;
    if (form.password.length < 6) return v.passwordShort;
    return "";
  };

  const goNext = () => {
    const err = validateStep0();
    if (err) { onAlert?.(err); return; }
    setStep(1);
  };

  const submit = async (e) => {
    e?.preventDefault();
    const err = step === 0 ? validateStep0() : "";
    if (err) { onAlert?.(err); return; }
    await onRegister({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      password: form.password,
      profile: {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        englishLevel: form.englishLevel,
      },
    });
  };

  const rc = t.registerCard;
  const f = rc.fields;

  return (
    <section className={isRegister ? "authShell authShellRegister" : "authShell"}>
      <div className="authBackdropGlow authGlowOne" />
      <div className="authBackdropGlow authGlowTwo" />

      <div className="authStandalone">
        <div className="authModeTabs" role="tablist" aria-label="Authentication mode">
          <button
            className={isRegister ? "authModeTab" : "authModeTab active"}
            type="button"
            onClick={() => { setIsRegister(false); setStep(0); }}
          >
            {t.login}
          </button>
          <button
            className={isRegister ? "authModeTab active" : "authModeTab"}
            type="button"
            onClick={() => { setIsRegister(true); setStep(0); }}
          >
            {t.register}
          </button>
        </div>

        {/* ── LOGIN ── */}
        {!isRegister && (
          <div className="authStandaloneCard">
            <p className="eyebrow">{t.loginCard.eyebrow}</p>
            <h2>{t.loginCard.heading}</h2>
            <p className="hint">{t.loginCard.hint}</p>

            {/* Google button */}
            <button
              type="button"
              onClick={() => onAlert?.("Tez kunda! Google orqali kirish qo'shilmoqda.")}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px 16px", border: "1.5px solid #dde3ed", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 500, color: "#1a2a3a", marginBottom: 4 }}
            >
              <GoogleIcon />
              {t.googleBtn}
            </button>

            <OrDivider label={t.orDivider} />

            <form
              className="formGrid authStandaloneForm"
              onSubmit={(e) => { e.preventDefault(); onLogin(loginForm); }}
            >
              <label className="authFieldLabel">
                <span>{t.loginCard.email}</span>
                <input
                  type="email"
                  placeholder={t.loginCard.emailPlaceholder}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label className="authFieldLabel">
                <span>{t.loginCard.password}</span>
                <input
                  type="password"
                  placeholder={t.loginCard.passwordPlaceholder}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </label>
              <button type="submit">{t.loginCard.submit}</button>
            </form>
          </div>
        )}

        {/* ── REGISTER ── */}
        {isRegister && (
          <div className="authStandaloneCard authStandaloneRegisterCard">
            <div className="authStandaloneHead">
              <div>
                <p className="eyebrow">{rc.eyebrow}</p>
                <h2>{rc.heading}</h2>
                <p className="hint">{rc.hint}</p>
              </div>
              <div className="authProgressCompact">
                <strong>{step + 1}/{t.steps.length}</strong>
                <span>{t.steps[step].label}</span>
              </div>
            </div>

            <div className="authProgress">
              <div className="authProgressTrack">
                <div className="authProgressFill" style={{ width: `${((step + 1) / t.steps.length) * 100}%` }} />
              </div>
            </div>

            <form className="formGrid authStandaloneForm" onSubmit={submit}>

              {/* ── STEP 0: Required fields ── */}
              {step === 0 && (
                <>
                  {/* Google button on step 0 */}
                  <button
                    type="button"
                    onClick={() => onAlert?.("Tez kunda! Google orqali kirish qo'shilmoqda.")}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px 16px", border: "1.5px solid #dde3ed", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 500, color: "#1a2a3a" }}
                  >
                    <GoogleIcon />
                    {t.googleBtn}
                  </button>

                  <OrDivider label={t.orDivider} />

                  <div className="formGrid authStepGrid authStandaloneGrid">
                    <label className="authFieldLabel">
                      <span>{f.firstName}</span>
                      <input placeholder={f.firstName} value={form.firstName} onChange={e => upd("firstName", e.target.value)} />
                    </label>
                    <label className="authFieldLabel">
                      <span>{f.lastName}</span>
                      <input placeholder={f.lastName} value={form.lastName} onChange={e => upd("lastName", e.target.value)} />
                    </label>
                    <label className="authFieldLabel authFieldWide">
                      <span>{f.email}</span>
                      <input type="email" placeholder={f.email} value={form.email} onChange={e => upd("email", e.target.value)} />
                    </label>
                    <label className="authFieldLabel">
                      <span>{f.password}</span>
                      <input type="password" placeholder={f.password} value={form.password} onChange={e => upd("password", e.target.value)} />
                    </label>
                    <label className="authFieldLabel">
                      <span>{f.confirmPassword}</span>
                      <input type="password" placeholder={f.confirmPassword} value={form.confirmPassword} onChange={e => upd("confirmPassword", e.target.value)} />
                    </label>
                    <label className="authFieldLabel authFieldWide">
                      <span>{f.phone}</span>
                      <input type="tel" placeholder={f.phone} value={form.phoneNumber} onChange={e => upd("phoneNumber", e.target.value)} />
                    </label>
                  </div>

                  <div className="inline authWizardActions">
                    <div />
                    <button type="button" onClick={goNext}>{rc.next}</button>
                  </div>
                </>
              )}

              {/* ── STEP 1: Optional details ── */}
              {step === 1 && (
                <>
                  <div className="formGrid authStepGrid authStandaloneGrid">
                    <label className="authFieldLabel">
                      <span>{f.dob}</span>
                      <input type="date" value={form.dateOfBirth} onChange={e => upd("dateOfBirth", e.target.value)} />
                    </label>
                    <label className="authFieldLabel">
                      <span>{f.gender}</span>
                      <select value={form.gender} onChange={e => upd("gender", e.target.value)}>
                        <option value="">{f.genderOptions.placeholder}</option>
                        <option value="male">{f.genderOptions.male}</option>
                        <option value="female">{f.genderOptions.female}</option>
                        <option value="other">{f.genderOptions.other}</option>
                      </select>
                    </label>
                    <label className="authFieldLabel authFieldWide">
                      <span>{f.englishLevel}</span>
                      <select value={form.englishLevel} onChange={e => upd("englishLevel", e.target.value)}>
                        <option value="">—</option>
                        {["beginner","elementary","pre-intermediate","intermediate","upper-intermediate","advanced"].map(l => (
                          <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="inline authWizardActions">
                    <button type="button" className="ghost" onClick={() => setStep(0)}>{rc.back}</button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="ghost" onClick={submit}
                        style={{ color: "#9aacbf", borderColor: "#dde3ed" }}>
                        {rc.skip}
                      </button>
                      <button type="submit">{rc.finish}</button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
