import { useEffect, useMemo, useState } from "react";

const fallbackQuestionCount = (programTitle, variant) => {
  if (programTitle?.toLowerCase().includes("english")) return 54;
  if (programTitle?.toLowerCase().includes("math")) return 44;
  if (variant === "practice") return 44;
  return 40;
};

const buildQuestionRows = (test, programTitle, variant) => {
  const targetCount = Number(test.questionCount) || fallbackQuestionCount(programTitle, variant);
  return Array.from({ length: targetCount }, (_, index) => {
    const existing = test.questions?.[index];
    if (existing) return existing;

    return {
      id: `${test.id}-placeholder-${index + 1}`,
      prompt: `Question ${index + 1} will be added here.`,
      answer: ""
    };
  });
};

export default function PracticeTest({ programTitle, tests, variant = "previous", onSubmitScore }) {
  const [scores, setScores] = useState({});
  const [selectedTestId, setSelectedTestId] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    setSelectedTestId("");
    setAnswers({});
  }, [tests, variant, programTitle]);

  const selectedTest = tests.find((item) => item.id === selectedTestId) || null;
  const questionRows = useMemo(
    () => (selectedTest ? buildQuestionRows(selectedTest, programTitle, variant) : []),
    [programTitle, selectedTest, variant]
  );

  if (!tests?.length) {
    return (
      <section className="card">
        <h2>{programTitle} {variant === "practice" ? "Practice Tests" : "Previous Tests"}</h2>
        <p>No tests have been added for this section yet.</p>
      </section>
    );
  }

  if (!selectedTest) {
    return (
      <section className="card stack" data-aos="fade-up">
        <div>
          <h2>{programTitle} {variant === "practice" ? "Practice Tests" : "Previous Tests"}</h2>
          <p>
            {variant === "practice"
              ? "Bluebook-style full practice tests open here."
              : "Choose a previous test date to open the full practice paper."}
          </p>
        </div>

        <div className="lessonCatalogGrid">
          {tests.map((test, index) => {
            const questionCount = Number(test.questionCount) || fallbackQuestionCount(programTitle, variant);
            return (
              <article className="levelCard testCatalogCard" key={test.id} data-aos="zoom-in" data-aos-delay={50 * (index + 1)}>
                <div className="stack">
                  <div>
                    <p className="eyebrow">{variant === "practice" ? "Practice test" : "Previous test"}</p>
                    <h3>{test.title}</h3>
                  </div>
                  <p className="badge">{questionCount} questions</p>
                  <p className="badge">Duration: {test.durationMinutes} mins</p>
                </div>
                <button onClick={() => setSelectedTestId(test.id)}>
                  Open Test
                </button>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="card stack" data-aos="fade-up">
      <div className="inline lessonTopActions">
        <button className="ghost" onClick={() => setSelectedTestId("")}>
          Back to {variant === "practice" ? "practice tests" : "previous tests"}
        </button>
      </div>

      <div className="lessonHeroCard">
        <div>
          <p className="eyebrow">{variant === "practice" ? "Practice test opened" : "Previous test opened"}</p>
          <h2>{selectedTest.title}</h2>
          <p className="hint">Work through the full set and save the final score when finished.</p>
        </div>
        <div className="lessonWorkspaceTotal">
          <strong>{questionRows.length}</strong>
          <span>Questions</span>
        </div>
      </div>

      <div className="testQuestionGrid">
        {questionRows.map((question, index) => (
          <article className="lessonItem testQuestionCard" key={question.id}>
            <div className="testQuestionHeader">
              <strong>Question {index + 1}</strong>
              <span className="badge">1 point</span>
            </div>
            <p className="lessonTextWrap">{question.prompt}</p>
            <input
              placeholder="Write the answer here"
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
            />
          </article>
        ))}
      </div>

      <div className="testScoreBar">
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Practice Score %"
          value={scores[selectedTest.id] || ""}
          onChange={(e) => setScores((prev) => ({ ...prev, [selectedTest.id]: e.target.value }))}
        />
        <button className="secondary" onClick={() => onSubmitScore(selectedTest.id, Number(scores[selectedTest.id] || 0))}>
          Save Practice Score
        </button>
      </div>
    </section>
  );
}
