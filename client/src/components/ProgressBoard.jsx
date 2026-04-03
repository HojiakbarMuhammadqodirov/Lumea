export default function ProgressBoard({ progress }) {
  if (!progress) return null;

  return (
    <section className="card">
      <h2>Progress Records</h2>
      <div className="stats">
        <div>
          <strong>{progress.completedLessons?.length || 0}</strong>
          <span>Completed Lessons</span>
        </div>
        <div>
          <strong>{progress.topicTestScores?.length || 0}</strong>
          <span>Topic Test Entries</span>
        </div>
        <div>
          <strong>{progress.practiceTestScores?.length || 0}</strong>
          <span>Practice Test Entries</span>
        </div>
      </div>
      <p className="hint">All records are saved in JSON format on the server.</p>
    </section>
  );
}

