const scoreLabels = {
  "sat-math": "SAT Math",
  "sat-english": "SAT English",
  "ielts-listening": "IELTS Listening",
  "ielts-reading": "IELTS Reading",
  "ielts-speaking": "IELTS Speaking",
  "ielts-writing": "IELTS Writing"
};

export default function TeacherDirectory({ teachers }) {
  if (!teachers.length) return null;

  return (
    <section className="card">
      <h2>My Teachers</h2>
      <div className="levels">
        {teachers.map((teacher) => (
          <article className="levelCard" key={`${teacher.id}-${teacher.programId}`}>
            <h3>{teacher.name}</h3>
            <p className="badge">{teacher.programId}</p>
            {Object.entries(teacher.scores).map(([key, value]) => (
              <p key={key}>
                {scoreLabels[key] || key}: <strong>{value || "Not set"}</strong>
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
