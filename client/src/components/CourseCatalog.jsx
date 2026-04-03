const levelLabel = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};

export default function CourseCatalog({
  courses,
  selectedProgramId,
  selectedLevelId,
  assignments,
  onSelectProgram,
  onSelectLevel,
  onOpenPractice
}) {
  if (!courses.length) {
    return (
    <section className="card" data-aos="fade-up">
        <h2>No Program Assigned</h2>
        <p>Ask admin or teacher to assign you to SAT Math, SAT English, or IELTS.</p>
      </section>
    );
  }

  const selectedProgram = courses.find((course) => course.id === selectedProgramId) || courses[0];
  const assignment = assignments.find((item) => item.programId === selectedProgram?.id);

  return (
    <section className="stack">
      <div className="menuBar" data-aos="fade-down">
        {courses.map((program) => {
          const current = assignments.find((item) => item.programId === program.id);
          return (
            <button
              key={program.id}
              className={program.id === selectedProgram?.id ? "menu active" : "menu"}
              onClick={() => onSelectProgram(program.id)}
            >
              {program.title} {current ? `(${levelLabel[current.levelId]})` : ""}
            </button>
          );
        })}
      </div>

      {selectedProgram && (
        <div className="card" data-aos="fade-up">
          <h2>{selectedProgram.title}</h2>
          <p>{selectedProgram.description}</p>
          <p className="badge">
            Current level: <strong>{levelLabel[assignment?.levelId] || "Not assigned"}</strong>
          </p>
          <div className="levels">
            {selectedProgram.levels.map((level) => {
              const unlocked = level.id === assignment?.levelId;
              return (
                <article
                  className={unlocked ? "levelCard levelCardCurrent" : "levelCard levelCardLocked"}
                  key={level.id}
                  data-aos="zoom-in"
                  data-aos-delay={70 * (selectedProgram.levels.findIndex((item) => item.id === level.id) + 1)}
                >
                  <h3>{level.title}</h3>
                  <p>{level.focus}</p>
                  <p className="badge">{level.lessons.length} lessons</p>
                  <button disabled={!unlocked} onClick={() => onSelectLevel(selectedProgram.id, level.id)}>
                    {selectedLevelId === level.id ? "Opened" : unlocked ? "Open Lessons" : "Locked"}
                  </button>
                </article>
              );
            })}
          </div>
          <button className="secondary" onClick={() => onOpenPractice(selectedProgram.id)}>
            Open Previous Tests
          </button>
        </div>
      )}
    </section>
  );
}
