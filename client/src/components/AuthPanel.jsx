import { useMemo, useState } from "react";

const steps = [
  { id: "personal", label: "Personal" },
  { id: "account", label: "Account" },
  { id: "address", label: "Address" },
  { id: "english", label: "English" },
  { id: "photo", label: "Photo" }
];

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

export default function AuthPanel({ onLogin, onRegister, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initial);
  const [localError, setLocalError] = useState("");

  const progress = useMemo(() => `${((step + 1) / steps.length) * 100}%`, [step]);

  const updateRegister = (key, value) => setRegisterForm((prev) => ({ ...prev, [key]: value }));

  const updatePicture = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateRegister("profilePicture", reader.result);
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!registerForm.firstName || !registerForm.lastName || !registerForm.dateOfBirth) {
        return "Please complete your full name and date of birth.";
      }
    }

    if (step === 1) {
      if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
        return "Please complete email and both password fields.";
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        return "Passwords do not match.";
      }
      if (registerForm.password.length < 6) {
        return "Password should be at least 6 characters.";
      }
    }

    if (step === 2) {
      if (!registerForm.addressLine1 || !registerForm.city || !registerForm.country) {
        return "Please complete the required address fields.";
      }
    }

    if (step === 3 && !registerForm.englishLevel) {
      return "Please choose your current English level.";
    }

    return "";
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");
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

  return (
    <section className={isRegister ? "authShell authShellRegister" : "authShell"}>
      <div className="authBackdropGlow authGlowOne" />
      <div className="authBackdropGlow authGlowTwo" />

      <div className="authStage">
        <div className="authForms">
          <div className="authPane">
            <div className={isRegister ? "authCard authCardHidden" : "authCard"}>
              <p className="eyebrow">Welcome Back</p>
              <h2>Login</h2>
              <p className="hint">Continue your Learnova study plan.</p>
              <form
                className="formGrid"
                onSubmit={(e) => {
                  e.preventDefault();
                  onLogin(loginForm);
                }}
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button type="submit">Login</button>
              </form>
            </div>

            <div className={isRegister ? "authCard authCardActive authCardWizard" : "authCard authCardRegister"}>
              <p className="eyebrow">New Student</p>
              <h2>Create Your Learnova Profile</h2>
              <div className="authProgress">
                <div className="authProgressTrack">
                  <div className="authProgressFill" style={{ width: progress }} />
                </div>
                <div className="authProgressLabels">
                  {steps.map((item, index) => (
                    <span
                      key={item.id}
                      className={index <= step ? "authProgressLabel active" : "authProgressLabel"}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              <form className="formGrid" onSubmit={submitRegistration}>
                {step === 0 && (
                  <div className="formGrid authStepGrid">
                    <input
                      placeholder="First name"
                      value={registerForm.firstName}
                      onChange={(e) => updateRegister("firstName", e.target.value)}
                    />
                    <input
                      placeholder="Surname"
                      value={registerForm.lastName}
                      onChange={(e) => updateRegister("lastName", e.target.value)}
                    />
                    <input
                      type="date"
                      value={registerForm.dateOfBirth}
                      onChange={(e) => updateRegister("dateOfBirth", e.target.value)}
                    />
                    <select value={registerForm.gender} onChange={(e) => updateRegister("gender", e.target.value)}>
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      placeholder="Phone number"
                      value={registerForm.phoneNumber}
                      onChange={(e) => updateRegister("phoneNumber", e.target.value)}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="formGrid authStepGrid">
                    <input
                      type="email"
                      placeholder="Email"
                      value={registerForm.email}
                      onChange={(e) => updateRegister("email", e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(e) => updateRegister("password", e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => updateRegister("confirmPassword", e.target.value)}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="formGrid authStepGrid">
                    <input
                      placeholder="Address line 1"
                      value={registerForm.addressLine1}
                      onChange={(e) => updateRegister("addressLine1", e.target.value)}
                    />
                    <input
                      placeholder="Address line 2"
                      value={registerForm.addressLine2}
                      onChange={(e) => updateRegister("addressLine2", e.target.value)}
                    />
                    <input
                      placeholder="City"
                      value={registerForm.city}
                      onChange={(e) => updateRegister("city", e.target.value)}
                    />
                    <input
                      placeholder="Country"
                      value={registerForm.country}
                      onChange={(e) => updateRegister("country", e.target.value)}
                    />
                    <input
                      placeholder="Postal code"
                      value={registerForm.postalCode}
                      onChange={(e) => updateRegister("postalCode", e.target.value)}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="formGrid authStepGrid">
                    <p className="hint authStepNote">
                      Choose the option that feels closest right now. We can still adjust your course level later.
                    </p>
                    <div className="authChoiceGrid">
                      {[
                        "beginner",
                        "elementary",
                        "pre-intermediate",
                        "intermediate",
                        "upper-intermediate",
                        "advanced"
                      ].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={
                            registerForm.englishLevel === level
                              ? "authChoiceCard authChoiceCardActive"
                              : "authChoiceCard"
                          }
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
                    <p className="hint authStepNote">
                      Optional step. Add a profile photo now or skip and change it later.
                    </p>
                    <div className="authPhotoUpload">
                      {registerForm.profilePicture ? (
                        <img className="authPhotoPreview" src={registerForm.profilePicture} alt="Profile preview" />
                      ) : (
                        <div className="authPhotoPreview authPhotoPlaceholder">Photo</div>
                      )}
                      <div className="formGrid grow">
                        <input type="file" accept="image/*" onChange={(e) => updatePicture(e.target.files?.[0])} />
                        <button type="button" className="ghost" onClick={() => updateRegister("profilePicture", "")}>
                          Skip For Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(localError || error) && <p className="error authInlineError">{localError || error}</p>}

                <div className="inline authWizardActions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setLocalError("");
                      setStep((current) => Math.max(current - 1, 0));
                    }}
                    disabled={step === 0}
                  >
                    Back
                  </button>
                  {step < steps.length - 1 ? (
                    <button type="button" onClick={nextStep}>
                      Next
                    </button>
                  ) : (
                    <button type="submit">Finish Registration</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <aside className="authSwitcher">
          <div className={isRegister ? "authGlassTrack authGlassTrackRight" : "authGlassTrack"}>
            <div className="authSwitcherFace">
              <p className="eyebrow">{isRegister ? `Step ${step + 1} of ${steps.length}` : "Need An Account?"}</p>
              <h2>{isRegister ? "Minimal, Guided Onboarding" : "Join Learnova"}</h2>
              <p>
                {isRegister
                  ? "Move through a clean step-by-step setup with a soft progress line, then begin with the right study path."
                  : "Blue glass, guided study, SAT and IELTS structure, and progress tracking from day one."}
              </p>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setLocalError("");
                  setIsRegister((value) => !value);
                }}
              >
                {isRegister ? "Switch To Login" : "Switch To Register"}
              </button>
              <div className="authMiniStats">
                <div>
                  <strong>5</strong>
                  <span>Steps</span>
                </div>
                <div>
                  <strong>Blue</strong>
                  <span>Glass UI</span>
                </div>
                <div>
                  <strong>Smart</strong>
                  <span>Onboarding</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
