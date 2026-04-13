import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

const initial = {
  firstName: "",
  lastName: "",
  gender: "",
  phoneNumber: "",
  dateOfBirth: "",
  email: "",
  password: "",
  confirmPassword: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
  postalCode: "",
  englishLevel: "",
  profilePicture: ""
};

export default function AuthPanel({ onLogin, onRegister, onAlert, defaultRegister = false }) {
  const { lang } = useLanguage();
  const t = translations[lang].auth;

  const [isRegister, setIsRegister] = useState(defaultRegister);
  const [step, setStep] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initial);

  const steps = t.steps;
  const progress = useMemo(() => `${((step + 1) / steps.length) * 100}%`, [step, steps.length]);

  const updateRegister = (key, value) => setRegisterForm((prev) => ({ ...prev, [key]: value }));

  const updatePicture = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateRegister("profilePicture", reader.result);
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    const v = t.validation;
    if (step === 0) {
      if (!registerForm.firstName || !registerForm.lastName || !registerForm.dateOfBirth) {
        return v.personalRequired;
      }
    }
    if (step === 1) {
      if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
        return v.accountRequired;
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        return v.passwordMismatch;
      }
      if (registerForm.password.length < 6) {
        return v.passwordShort;
      }
    }
    if (step === 2) {
      if (!registerForm.addressLine1 || !registerForm.city || !registerForm.country) {
        return v.addressRequired;
      }
    }
    if (step === 3 && !registerForm.englishLevel) {
      return v.englishRequired;
    }
    return "";
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      onAlert?.(validationError);
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      onAlert?.(validationError);
      return;
    }
    await onRegister({
      name: `${registerForm.firstName} ${registerForm.lastName}`.trim(),
      email: registerForm.email,
      password: registerForm.password,
      profile: {
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        gender: registerForm.gender,
        phoneNumber: registerForm.phoneNumber,
        dateOfBirth: registerForm.dateOfBirth,
        addressLine1: registerForm.addressLine1,
        addressLine2: registerForm.addressLine2,
        city: registerForm.city,
        country: registerForm.country,
        postalCode: registerForm.postalCode,
        englishLevel: registerForm.englishLevel,
        profilePicture: registerForm.profilePicture
      }
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
            onClick={() => setIsRegister(false)}
          >
            {t.login}
          </button>
          <button
            className={isRegister ? "authModeTab active" : "authModeTab"}
            type="button"
            onClick={() => setIsRegister(true)}
          >
            {t.register}
          </button>
        </div>

        {!isRegister && (
          <div className="authStandaloneCard">
            <p className="eyebrow">{t.loginCard.eyebrow}</p>
            <h2>{t.loginCard.heading}</h2>
            <p className="hint">{t.loginCard.hint}</p>
            <form
              className="formGrid authStandaloneForm"
              onSubmit={(e) => {
                e.preventDefault();
                onLogin(loginForm);
              }}
            >
              <label className="authFieldLabel">
                <span>{t.loginCard.email}</span>
                <input
                  type="email"
                  placeholder={t.loginCard.emailPlaceholder}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label className="authFieldLabel">
                <span>{t.loginCard.password}</span>
                <input
                  type="password"
                  placeholder={t.loginCard.passwordPlaceholder}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </label>
              <button type="submit">{t.loginCard.submit}</button>
            </form>
          </div>
        )}

        {isRegister && (
          <div className="authStandaloneCard authStandaloneRegisterCard">
            <div className="authStandaloneHead">
              <div>
                <p className="eyebrow">{rc.eyebrow}</p>
                <h2>{rc.heading}</h2>
                <p className="hint">{rc.hint}</p>
              </div>
              <div className="authProgressCompact">
                <strong>{step + 1}/{steps.length}</strong>
                <span>{steps[step].label}</span>
              </div>
            </div>

            <div className="authProgress">
              <div className="authProgressTrack">
                <div className="authProgressFill" style={{ width: progress }} />
              </div>
            </div>

            <form className="formGrid authStandaloneForm" onSubmit={submitRegistration}>
              {step === 0 && (
                <div className="formGrid authStepGrid authStandaloneGrid">
                  <label className="authFieldLabel">
                    <span>{f.firstName}</span>
                    <input placeholder={f.firstName} value={registerForm.firstName} onChange={(e) => updateRegister("firstName", e.target.value)} />
                  </label>
                  <label className="authFieldLabel">
                    <span>{f.lastName}</span>
                    <input placeholder={f.lastName} value={registerForm.lastName} onChange={(e) => updateRegister("lastName", e.target.value)} />
                  </label>
                  <label className="authFieldLabel">
                    <span>{f.dob}</span>
                    <input type="date" value={registerForm.dateOfBirth} onChange={(e) => updateRegister("dateOfBirth", e.target.value)} />
                  </label>
                  <label className="authFieldLabel">
                    <span>{f.gender}</span>
                    <select value={registerForm.gender} onChange={(e) => updateRegister("gender", e.target.value)}>
                      <option value="">{f.genderOptions.placeholder}</option>
                      <option value="male">{f.genderOptions.male}</option>
                      <option value="female">{f.genderOptions.female}</option>
                      <option value="other">{f.genderOptions.other}</option>
                    </select>
                  </label>
                  <label className="authFieldLabel authFieldWide">
                    <span>{f.phone}</span>
                    <input placeholder={f.phone} value={registerForm.phoneNumber} onChange={(e) => updateRegister("phoneNumber", e.target.value)} />
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="formGrid authStepGrid authStandaloneGrid">
                  <label className="authFieldLabel authFieldWide">
                    <span>{f.email}</span>
                    <input type="email" placeholder={f.email} value={registerForm.email} onChange={(e) => updateRegister("email", e.target.value)} />
                  </label>
                  <label className="authFieldLabel">
                    <span>{f.password}</span>
                    <input type="password" placeholder={f.password} value={registerForm.password} onChange={(e) => updateRegister("password", e.target.value)} />
                  </label>
                  <label className="authFieldLabel">
                    <span>{f.confirmPassword}</span>
                    <input type="password" placeholder={f.confirmPassword} value={registerForm.confirmPassword} onChange={(e) => updateRegister("confirmPassword", e.target.value)} />
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="formGrid authStepGrid authStandaloneGrid">
                  <label className="authFieldLabel authFieldWide">
                    <span>{f.address1}</span>
                    <input placeholder={f.address1} value={registerForm.addressLine1} onChange={(e) => updateRegister("addressLine1", e.target.value)} />
                  </label>
                  <label className="authFieldLabel authFieldWide">
                    <span>{f.address2}</span>
                    <input placeholder={f.address2} value={registerForm.addressLine2} onChange={(e) => updateRegister("addressLine2", e.target.value)} />
                  </label>
                  <label className="authFieldLabel">
                    <span>{f.city}</span>
                    <input placeholder={f.city} value={registerForm.city} onChange={(e) => updateRegister("city", e.target.value)} />
                  </label>
                  <label className="authFieldLabel">
                    <span>{f.country}</span>
                    <input placeholder={f.country} value={registerForm.country} onChange={(e) => updateRegister("country", e.target.value)} />
                  </label>
                  <label className="authFieldLabel authFieldWide">
                    <span>{f.postalCode}</span>
                    <input placeholder={f.postalCode} value={registerForm.postalCode} onChange={(e) => updateRegister("postalCode", e.target.value)} />
                  </label>
                </div>
              )}

              {step === 3 && (
                <div className="formGrid authStepGrid">
                  <p className="hint authStepNote">{rc.englishHint}</p>
                  <div className="authChoiceGrid">
                    {["beginner","elementary","pre-intermediate","intermediate","upper-intermediate","advanced"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={registerForm.englishLevel === level ? "authChoiceCard authChoiceCardActive" : "authChoiceCard"}
                        onClick={() => updateRegister("englishLevel", level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="formGrid authStepGrid">
                  <p className="hint authStepNote">{rc.photoHint}</p>
                  <div className="authPhotoUpload">
                    {registerForm.profilePicture ? (
                      <img className="authPhotoPreview" src={registerForm.profilePicture} alt="Profile preview" />
                    ) : (
                      <div className="authPhotoPreview authPhotoPlaceholder">{rc.photoPlaceholder}</div>
                    )}
                    <div className="formGrid grow">
                      <input type="file" accept="image/*" onChange={(e) => updatePicture(e.target.files?.[0])} />
                      <button type="button" className="ghost" onClick={() => updateRegister("profilePicture", "")}>
                        {rc.skipPhoto}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="inline authWizardActions">
                <button type="button" className="ghost" onClick={() => setStep((c) => Math.max(c - 1, 0))} disabled={step === 0}>
                  {rc.back}
                </button>
                {step < steps.length - 1 ? (
                  <button type="button" onClick={nextStep}>{rc.next}</button>
                ) : (
                  <button type="submit">{rc.finish}</button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
