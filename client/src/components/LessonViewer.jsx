import { useMemo, useState } from "react";

const lessonKey = (programId, levelId, lessonId) => `${programId}-${levelId}-${lessonId}`;
const lessonPoints = (activity) =>
  (activity?.videoCompleted ? 10 : 0) + (activity?.learningCompleted ? 10 : 0) + (activity?.taskCompleted ? 10 : 0);
const demoTaskKey = (programId, levelId, lessonId) => `${programId}:${levelId}:${lessonId}`;

const demoTasks = {
  "sat-math:beginner:beginner-lesson-3": {
    type: "sat",
    title: "Module 1 • Question 8",
    subtitle: "Calculator allowed",
    prompt:
      "The equation 4(x - 3) = 2x + 10 appears in a linear-equations practice set. What is the value of x?",
    choices: [
      { id: "A", text: "5" },
      { id: "B", text: "9" },
      { id: "C", text: "11" },
      { id: "D", text: "16" }
    ]
  },
  "ielts:beginner:beginner-lesson-3": {
    type: "ielts",
    title: "Listening Part 1",
    subtitle: "Questions 1-5 • CD 1, Track 3",
    instruction: "Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer.",
    prompt:
      "You hear a conversation between a student and a receptionist about an English course. Complete the note below.",
    noteTitle: "Course Enrolment",
    noteLines: [
      "Course starts on: ________",
      "Classroom number: ________",
      "Course fee: ________ dollars"
    ]
  }
};

export default function LessonViewer({
  program,
  level,
  progress,
  onCompleteLesson,
  onSubmitTopicScore,
  onSaveLessonActivity
}) {
  const [scores, setScores] = useState({});
  const [activeLessonId, setActiveLessonId] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [slideIndex, setSlideIndex] = useState(0);
  const [demoAnswers, setDemoAnswers] = useState({});

  const activityMap = useMemo(
    () =>
      new Map(
        (progress?.lessonActivity || []).map((item) => [lessonKey(item.programId, item.levelId, item.lessonId), item])
      ),
    [progress?.lessonActivity]
  );

  if (!program || !level) return null;

  const activeLesson = level.lessons.find((lesson) => lesson.id === activeLessonId);
  const activeActivity = activeLesson
    ? activityMap.get(lessonKey(program.id, level.id, activeLesson.id))
    : null;
  const slides = activeLesson?.learningSlides || [];
  const currentSlide = slides[slideIndex] || slides[0];
  const demoTask = activeLesson ? demoTasks[demoTaskKey(program.id, level.id, activeLesson.id)] : null;

  if (!activeLesson) {
    return (
      <section className="card" data-aos="fade-up">
        <div className="dashboardCardHead" data-aos="fade-down">
          <div>
            <h2>
              {program.title} • {level.title}
            </h2>
            <p className="hint">Choose a lesson first. The lesson details open after you click one.</p>
          </div>
        </div>

        <div className="lessonCatalogGrid">
          {level.lessons.map((lesson, index) => {
            const activity = activityMap.get(lessonKey(program.id, level.id, lesson.id));
            return (
              <article className="levelCard" key={lesson.id} data-aos="zoom-in" data-aos-delay={60 * (index + 1)}>
                <p className="badge">Lesson {index + 1}</p>
                <h3>{lesson.title}</h3>
                <p>{lessonPoints(activity)}/30 points</p>
                <button
                  onClick={() => {
                    setActiveLessonId(lesson.id);
                    setActiveSection("overview");
                    setSlideIndex(0);
                  }}
                >
                  Open lesson
                </button>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (activeSection === "learning") {
    return (
      <section className="card lessonDetailCard" data-aos="fade-up">
        <div className="dashboardCardHead" data-aos="fade-down">
          <div>
            <p className="eyebrow">Learning opened</p>
            <h2>{activeLesson.title}</h2>
            <p className="hint">Move slide by slide through the lesson and then mark it complete.</p>
          </div>
          <div className="inline lessonTopActions">
            <span className={activeActivity?.learningCompleted ? "stepBadge complete" : "stepBadge"}>10 pts</span>
            <button className="ghost" onClick={() => setActiveSection("overview")}>
              Back to lesson
            </button>
          </div>
        </div>

        {currentSlide && (
          <article className="learningSlideCard lessonLearningStage">
            <p className="badge">
              Step {slideIndex + 1} of {slides.length}
            </p>
            <h3>{currentSlide.title}</h3>
            <p>{currentSlide.content}</p>
          </article>
        )}

        <div className="lessonActionRow">
          <button
            className="ghost lessonMiniButton"
            disabled={slideIndex === 0}
            onClick={() => setSlideIndex((current) => Math.max(0, current - 1))}
          >
            Previous
          </button>
          <button
            className="ghost lessonMiniButton"
            disabled={slideIndex >= slides.length - 1}
            onClick={() => setSlideIndex((current) => Math.min(slides.length - 1, current + 1))}
          >
            Next
          </button>
        </div>

        <div className="lessonActionArea">
          <button
            className="secondary lessonActionButton"
            onClick={() => onSaveLessonActivity(program.id, level.id, activeLesson.id, "learningCompleted", true)}
          >
            {activeActivity?.learningCompleted ? "Learning done" : "Mark learning done"}
          </button>
        </div>
      </section>
    );
  }

  if (activeSection === "task") {
    if (demoTask?.type === "sat") {
      return (
        <section className="satExamShell" data-aos="fade-up">
          <div className="satExamHeader">
            <div className="satExamHeaderLeft">
              <button className="ghost satExitButton" onClick={() => setActiveSection("overview")}>
                Exit
              </button>
              <div>
                <p className="satExamMeta">Section 2, Module 2</p>
                <strong>{program.title}</strong>
              </div>
            </div>

            <div className="satExamHeaderCenter">
              <strong>30:50</strong>
              <button className="ghost satHideButton" type="button">
                Hide
              </button>
            </div>

            <div className="satExamHeaderRight">
              <button className="ghost satUtilityButton" type="button">
                Calculator
              </button>
              <button className="ghost satUtilityButton" type="button">
                Reference
              </button>
            </div>
          </div>

          <div className="satExamDirections">
            <span>Directions</span>
          </div>

          <div className="satExamBody">
            <div className="satQuestionTopline">
              <span className="satQuestionBadge">10</span>
              <label className="satReviewToggle">
                <input type="checkbox" />
                <span>Mark for Review</span>
              </label>
            </div>

            <div className="satExamQuestionWrap">
              <p className="satQuestionPrompt">{demoTask.prompt}</p>
              <div className="satChoiceGrid">
                {demoTask.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={demoAnswers[activeLesson.id] === choice.id ? "satChoiceButton active" : "satChoiceButton"}
                    onClick={() => setDemoAnswers((prev) => ({ ...prev, [activeLesson.id]: choice.id }))}
                  >
                    <span>{choice.id}</span>
                    <strong>{choice.text}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="satExamFooter">
            <span className="satQuestionCounter">Question 10 of 22</span>
            <div className="satExamFooterActions">
              <button className="ghost" type="button">
                Back
              </button>
              <button type="button">Next</button>
            </div>
          </div>

          <div className="satExamScoreBar">
            <input
              type="number"
              min="0"
              max="100"
              className="lessonScoreInput"
              placeholder="Task score %"
              value={scores[activeLesson.id] || ""}
              onChange={(e) => setScores((prev) => ({ ...prev, [activeLesson.id]: e.target.value }))}
            />
            <button
              className="secondary"
              onClick={async () => {
                const score = Number(scores[activeLesson.id] || 0);
                await onSubmitTopicScore(program.id, level.id, activeLesson.id, score);
                await onSaveLessonActivity(program.id, level.id, activeLesson.id, "taskCompleted", true, score);
              }}
            >
              Save task score
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="card lessonDetailCard" data-aos="fade-up">
        <div className="dashboardCardHead" data-aos="fade-down">
          <div>
            <p className="eyebrow">Task opened</p>
            <h2>{activeLesson.title}</h2>
            <p className="hint">100 questions are planned for this lesson task.</p>
          </div>
          <div className="inline lessonTopActions">
            <span className={activeActivity?.taskCompleted ? "stepBadge complete" : "stepBadge"}>10 pts</span>
            <button className="ghost" onClick={() => setActiveSection("overview")}>
              Back to lesson
            </button>
          </div>
        </div>

        <article className="lessonStepCard lessonTaskStage">
          {demoTask?.type === "ielts" && (
            <div className="ieltsDemoScreen" data-aos="fade-up">
              <div className="ieltsDemoTopbar">
                <div>
                  <p className="eyebrow">IELTS Demo</p>
                  <strong>{demoTask.title}</strong>
                </div>
                <span className="ieltsDemoTrack">{demoTask.subtitle}</span>
              </div>

              <div className="ieltsAudioPlayer">
                <button type="button" className="ieltsPlayButton">
                  Play
                </button>
                <div className="ieltsAudioProgress">
                  <span />
                </div>
                <small>00:42 / 02:10</small>
              </div>

              <div className="ieltsDemoBody">
                <div className="ieltsPromptPanel">
                  <p className="hint">{demoTask.instruction}</p>
                  <p>{demoTask.prompt}</p>
                  <div className="ieltsNoteCard">
                    <h4>{demoTask.noteTitle}</h4>
                    {demoTask.noteLines.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="ieltsAnswerPanel">
                  <h4>Answer area</h4>
                  <input
                    placeholder="1. Start date"
                    value={demoAnswers[`${activeLesson.id}-1`] || ""}
                    onChange={(e) => setDemoAnswers((prev) => ({ ...prev, [`${activeLesson.id}-1`]: e.target.value }))}
                  />
                  <input
                    placeholder="2. Classroom number"
                    value={demoAnswers[`${activeLesson.id}-2`] || ""}
                    onChange={(e) => setDemoAnswers((prev) => ({ ...prev, [`${activeLesson.id}-2`]: e.target.value }))}
                  />
                  <input
                    placeholder="3. Course fee"
                    value={demoAnswers[`${activeLesson.id}-3`] || ""}
                    onChange={(e) => setDemoAnswers((prev) => ({ ...prev, [`${activeLesson.id}-3`]: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <p className="hint">Save the lesson task score after the student finishes the task.</p>
          <div className="lessonActionColumn">
            <input
              type="number"
              min="0"
              max="100"
              className="lessonScoreInput"
              placeholder="Task score %"
              value={scores[activeLesson.id] || ""}
              onChange={(e) => setScores((prev) => ({ ...prev, [activeLesson.id]: e.target.value }))}
            />
            <button
              className="secondary lessonActionButton"
              onClick={async () => {
                const score = Number(scores[activeLesson.id] || 0);
                await onSubmitTopicScore(program.id, level.id, activeLesson.id, score);
                await onSaveLessonActivity(program.id, level.id, activeLesson.id, "taskCompleted", true, score);
              }}
            >
              Save task score
            </button>
          </div>

          {activeActivity?.taskCompleted && <p className="hint">Latest task score: {activeActivity.taskScore || 0}%</p>}
        </article>
      </section>
    );
  }

  return (
    <section className="card lessonDetailCard" data-aos="fade-up">
      <div className="dashboardCardHead" data-aos="fade-down">
        <div>
          <p className="eyebrow">Lesson opened</p>
          <h2>{activeLesson.title}</h2>
          <p className="hint">Open each part separately to keep the lesson page cleaner and shorter.</p>
        </div>
        <div className="inline lessonTopActions">
          <span className="ratingPill">{lessonPoints(activeActivity)}/30</span>
          <button
            className="ghost"
            onClick={() => {
              setActiveLessonId("");
              setActiveSection("overview");
            }}
          >
            Back to lessons
          </button>
        </div>
      </div>

      <div className="lessonOverviewGrid">
        <article className="lessonStepCard lessonStepCardCompact" data-aos="fade-up" data-aos-delay="60">
          <div className="lessonStepHeader">
            <div>
              <h4>1. Watch video</h4>
              <p className="hint">Open the lesson video in a new tab and then mark it watched.</p>
            </div>
            <span className={activeActivity?.videoCompleted ? "stepBadge complete" : "stepBadge"}>10 pts</span>
          </div>

          <div className="lessonActionArea">
            <button
              className="ghost lessonActionButton"
              disabled={!activeLesson.videoUrl}
              onClick={() => window.open(activeLesson.videoUrl, "_blank", "noopener,noreferrer")}
            >
              Watch
            </button>
            <button
              className="lessonActionButton"
              onClick={async () => {
                await onCompleteLesson(program.id, level.id, activeLesson.id);
                await onSaveLessonActivity(program.id, level.id, activeLesson.id, "videoCompleted", true);
              }}
            >
              {activeActivity?.videoCompleted ? "Watched" : "Mark watched"}
            </button>
          </div>
        </article>

        <article className="lessonStepCard lessonStepCardCompact" data-aos="fade-up" data-aos-delay="120">
          <div className="lessonStepHeader">
            <div>
              <h4>2. Learning part</h4>
              <p className="hint">Open the lesson slides in a separate page and move through each step there.</p>
            </div>
            <span className={activeActivity?.learningCompleted ? "stepBadge complete" : "stepBadge"}>10 pts</span>
          </div>

          <div className="lessonActionArea">
            <button className="secondary lessonActionButton" onClick={() => setActiveSection("learning")}>
              Open lesson
            </button>
          </div>
        </article>

        <article className="lessonStepCard lessonStepCardCompact" data-aos="fade-up" data-aos-delay="180">
          <div className="lessonStepHeader">
            <div>
              <h4>3. Task result</h4>
              <p className="hint">100 questions are planned for the lesson task.</p>
            </div>
            <span className={activeActivity?.taskCompleted ? "stepBadge complete" : "stepBadge"}>10 pts</span>
          </div>

          <div className="lessonActionArea">
            <button className="secondary lessonActionButton" onClick={() => setActiveSection("task")}>
              Open task
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
