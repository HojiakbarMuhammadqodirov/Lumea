import { useEffect, useState } from "react";
import Modal from "./Modal";

const scoreLabels = {
  "sat-math": "SAT Math",
  "sat-english": "SAT EBRW",
  ielts: "IELTS",
  "ielts-listening": "IELTS Listening",
  "ielts-reading": "IELTS Reading",
  "ielts-speaking": "IELTS Speaking",
  "ielts-writing": "IELTS Writing"
};

function DetailRow({ label, value }) {
  return (
    <article className="levelCard">
      <p className="badge">{label}</p>
      <strong>{value || "Not mentioned"}</strong>
    </article>
  );
}

export default function ProfilePanel({ user, onSave, onLogout }) {
  const [form, setForm] = useState(user.profile || {});
  const [programScores, setProgramScores] = useState(user.programScores || {});
  const [targetScores, setTargetScores] = useState(user.targetScores || {});
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setForm(user.profile || {});
    setProgramScores(user.programScores || {});
    setTargetScores(user.targetScores || {});
  }, [user]);

  const updatePicture = (file) => {
    if (!file) return;
    setFileName(file.name || "");
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <section className="card" data-aos="fade-up">
        <div className="dashboardCardHead" data-aos="fade-down">
          <div className="profileHero">
            {user.profile?.profilePicture ? (
              <img className="avatar profileHeroAvatar" src={user.profile.profilePicture} alt={user.name} />
            ) : (
              <div className="avatar placeholder profileHeroAvatar">{user.name?.slice(0, 1) || "U"}</div>
            )}
            <div>
              <p className="eyebrow">Profile</p>
              <h2>{user.name}</h2>
              <p className="hint">{user.role}</p>
            </div>
          </div>
          <div className="inline">
            <button className="ghost" onClick={() => setOpen(true)}>
              Edit
            </button>
            <button className="danger" onClick={onLogout}>
              Quit
            </button>
          </div>
        </div>

        <div className="vocabularyGrid">
          <DetailRow label="Phone" value={user.profile?.phoneNumber} />
          <DetailRow label="Date of birth" value={user.profile?.dateOfBirth} />
          <DetailRow label="Gender" value={user.profile?.gender} />
          <DetailRow label="English level" value={user.profile?.englishLevel} />
          <DetailRow label="Address line 1" value={user.profile?.addressLine1} />
          <DetailRow label="Address line 2" value={user.profile?.addressLine2} />
          <DetailRow label="City" value={user.profile?.city} />
          <DetailRow label="Country" value={user.profile?.country} />
          <DetailRow label="Postal code" value={user.profile?.postalCode} />
        </div>

        {user.role === "student" && (
          <>
            <h3>Target scores</h3>
            <div className="vocabularyGrid">
              {(user.programAssignments || []).map((assignment) => (
                <DetailRow
                  key={assignment.programId}
                  label={scoreLabels[assignment.programId] || assignment.programId}
                  value={user.targetScores?.[assignment.programId] || "Didn't mention"}
                />
              ))}
            </div>
          </>
        )}

        {user.role === "teacher" && (
          <>
            <h3>Program scores</h3>
            <div className="vocabularyGrid">
              {(user.programAccess || []).map((program) => (
                <DetailRow key={program} label={scoreLabels[program] || program} value={user.programScores?.[program]} />
              ))}
            </div>
          </>
        )}
      </section>

      {open && (
        <Modal title="Edit Profile" onClose={() => setOpen(false)} wide>
          <form
            className="formGrid profileGrid profileEditShell"
            data-aos="zoom-in"
            onSubmit={async (e) => {
              e.preventDefault();
              if (user.role === "student") {
                await onSave({ profile: form, targetScores });
              } else {
                await onSave({ profile: form, programScores });
              }
              setOpen(false);
            }}
          >
            <div className="profileEditIntro">
              <p className="eyebrow">Personal details</p>
              <p className="hint">Update the student information, contact details, and scores here.</p>
            </div>
            <input placeholder="Name" value={form.firstName || ""} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} />
            <input placeholder="Surname" value={form.lastName || ""} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
            <select value={form.gender || ""} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select value={form.englishLevel || ""} onChange={(e) => setForm((prev) => ({ ...prev, englishLevel: e.target.value }))}>
              <option value="">English level</option>
              <option value="beginner">Beginner</option>
              <option value="elementary">Elementary</option>
              <option value="pre-intermediate">Pre-Intermediate</option>
              <option value="intermediate">Intermediate</option>
              <option value="upper-intermediate">Upper-Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input placeholder="Phone number" value={form.phoneNumber || ""} onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} />
            <input type="date" value={form.dateOfBirth || ""} onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} />
            <input placeholder="Address line 1" value={form.addressLine1 || ""} onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))} />
            <input placeholder="Address line 2" value={form.addressLine2 || ""} onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))} />
            <input placeholder="City" value={form.city || ""} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
            <input placeholder="Country" value={form.country || ""} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
            <input placeholder="Postal code" value={form.postalCode || ""} onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))} />
            <label className="fileUploadField">
              <span className="fileUploadButton">Choose photo</span>
              <span className="fileUploadName">{fileName || "No file selected"}</span>
              <input type="file" accept="image/*" onChange={(e) => updatePicture(e.target.files?.[0])} />
            </label>

            {user.role === "teacher" &&
              user.programAccess?.map((program) => (
                <input
                  key={program}
                  placeholder={`${scoreLabels[program] || program} score`}
                  value={programScores[program] || ""}
                  onChange={(e) => setProgramScores((prev) => ({ ...prev, [program]: e.target.value }))}
                />
              ))}

            {user.role === "student" &&
              user.programAssignments?.map((assignment) => (
                <input
                  key={assignment.programId}
                  placeholder={`${scoreLabels[assignment.programId] || assignment.programId} target score`}
                  value={targetScores[assignment.programId] || ""}
                  onChange={(e) => setTargetScores((prev) => ({ ...prev, [assignment.programId]: e.target.value }))}
                />
              ))}

            <div className="inline modalActions">
              <button type="submit">Save Profile</button>
              <button className="ghost" type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
