import { useEffect, useMemo, useState } from "react";
import CourseCatalog from "./CourseCatalog";
import LessonViewer from "./LessonViewer";
import PracticeTest from "./PracticeTest";
import TeacherDirectory from "./TeacherDirectory";
import ChatPanel from "./ChatPanel";
import ProfilePanel from "./ProfilePanel";
import GraphingCalculator from "./GraphingCalculator";

const labels = {
  "sat-math": "SAT Math",
  "sat-english": "SAT EBRW",
  ielts: "IELTS"
};

const navIconPaths = {
  menu: "M3 5h18M3 12h18M3 19h18",
  home: "M4 11l8-6 8 6v8H4z",
  lessons: "M4 6h16v12H4z M8 6v12",
  tests: "M7 6h10M7 12h10M7 18h6",
  "practice-tests": "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  tools: "M14 4l6 6-9 9H5v-6zM13 5l6 6",
  rating: "M12 3l2.8 5.7 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.6 3 1.1-6.1L3 9.6l6.2-.9z",
  teachers: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0",
  chat: "M4 5h16v11H8l-4 4z",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0"
};

const cardIconPaths = {
  home: "M4 11l8-6 8 6v8H4z",
  lessons: "M5 5h14v14H5z M9 5v14",
  tools: "M14 4l6 6-9 9H5v-6zM13 5l6 6",
  rating: "M12 3l2.8 5.7 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.6 3 1.1-6.1L3 9.6l6.2-.9z",
  tests: "M7 6h10M7 12h10M7 18h6",
  "practice-tests": "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  teachers: "M12 5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z M6 20a6 6 0 0112 0",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0"
};

const toolCatalog = {
  "sat-math": {
    id: "desmos",
    title: "Desmos",
    description: "Open the calculator students use for SAT Math practice.",
    url: "https://www.desmos.com/calculator"
  },
  "sat-english": {
    id: "sat-dictionary",
    title: "SAT Dictionary",
    description: "Open a dictionary tool for SAT EBRW vocabulary work.",
    url: "https://dictionary.cambridge.org/"
  },
  ielts: {
    id: "ielts-dictionary",
    title: "IELTS Dictionary",
    description: "Open a dictionary tool for IELTS reading and writing support.",
    url: "https://dictionary.cambridge.org/"
  }
};

const lessonIdentity = (item) => `${item.programId}-${item.levelId}-${item.lessonId}`;
const lessonPoints = (item) =>
  (item?.videoCompleted ? 10 : 0) + (item?.learningCompleted ? 10 : 0) + (item?.taskCompleted ? 10 : 0);
const buildBluebookTests = (programId) => {
  if (programId === "sat-math") {
    return Array.from({ length: 7 }, (_, index) => ({
      id: `sat-math-bluebook-${index + 4}`,
      title: `Bluebook Practice Test ${index + 4}`,
      durationMinutes: 70,
      questionCount: 44,
      questions: []
    }));
  }

  if (programId === "sat-english") {
    return Array.from({ length: 7 }, (_, index) => ({
      id: `sat-english-bluebook-${index + 4}`,
      title: `Bluebook Practice Test ${index + 4}`,
      durationMinutes: 64,
      questionCount: 54,
      questions: []
    }));
  }

  return [];
};

const resolveLessonTitle = (courses, item) => {
  const program = courses.find((row) => row.id === item.programId);
  const level = program?.levels.find((row) => row.id === item.levelId);
  const lesson = level?.lessons.find((row) => row.id === item.lessonId);
  return lesson?.title || item.lessonId;
};

function TwoDIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={navIconPaths[name]} />
    </svg>
  );
}

function ThreeDIcon({ name }) {
  return (
    <span className="iconBadge3d">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={cardIconPaths[name]} />
      </svg>
    </span>
  );
}

function GlassIcon({ name }) {
  return (
    <span className="glassIconBadge">
      <span className="glassIconGlow" />
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={cardIconPaths[name]} />
      </svg>
    </span>
  );
}

function StudentHome({ user, courses, progress, myTeachers, onOpenTab }) {
  const lessonActivity = [...(progress?.lessonActivity || [])].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  );
  const recentLessons = lessonActivity.slice(0, 4);
  const totalPoints = lessonActivity.reduce((sum, item) => sum + lessonPoints(item), 0);

  const cards = [
    {
      id: "lessons",
      title: "Last lessons",
      description: "Review the most recent attended lessons and continue learning from there."
    },
    {
      id: "tools",
      title: "Tools",
      description: "Open Desmos or the right dictionary based on the active programs."
    },
    {
      id: "tests",
      title: "Previous tests",
      description: "Open previous official-style tests for the active program and practice by date."
    },
    {
      id: "practice-tests",
      title: "Practice tests",
      description: "Open Bluebook-style SAT practice tests 4 through 10 in a separate space."
    },
    {
      id: "rating",
      title: "Rating",
      description: `Current total: ${totalPoints} points across completed lesson steps.`
    },
    {
      id: "teachers",
      title: "Teachers",
      description: myTeachers.length ? myTeachers.map((teacher) => teacher.name).join(", ") : "No teacher assigned yet."
    },
    {
      id: "profile",
      title: "Profile",
      description: "Open the profile page to review details, targets, and account information."
    }
  ];

  return (
    <div className="dashboardMainGrid dashboardMainGridCompact">
      <section className="dashboardCard greetingCard" data-aos="fade-up">
        <div className="dashboardCardTitle">
          <GlassIcon name="home" />
          <div>
            <p className="eyebrow">Welcome</p>
            <h1>{user.name}</h1>
          </div>
        </div>
        <p className="hint">Study flow, tools, target scores, and progress are all in one student space.</p>
      </section>

      <div className="studentQuickGrid">
        {cards.map((card) => (
          <button
            key={card.id}
            className="quickAccessCard"
            onClick={() => onOpenTab(card.id)}
            data-aos="zoom-in"
            data-aos-delay={40 * (cards.findIndex((item) => item.id === card.id) + 1)}
          >
            <GlassIcon name={card.id} />
            <strong>{card.title}</strong>
            <div className="quickAccessHint">{card.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function InternalToolsPanel({ assignments, activeToolId, onOpenTool, onBack }) {
  if (activeToolId === "desmos") {
    return <GraphingCalculator onBack={onBack} />;
  }

  const tools = assignments
    .map((assignment) => toolCatalog[assignment.programId])
    .filter(Boolean)
    .filter((tool, index, rows) => rows.findIndex((item) => item.id === tool.id) === index);

  return (
    <section className="card" data-aos="fade-up">
      <div className="dashboardCardHead">
        <div className="dashboardCardTitle">
          <ThreeDIcon name="tools" />
          <div>
            <h2>Tools</h2>
            <p className="hint">Open the right practice tool for the student's active programs.</p>
          </div>
        </div>
      </div>
      <div className="vocabularyGrid">
        {tools.map((tool) => (
          <article className="levelCard" key={tool.id} data-aos="fade-up" data-aos-delay="60">
            <div className="dashboardCardTitle">
              <ThreeDIcon name="tools" />
              <div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
            </div>
            {tool.id === "desmos" ? (
              <button className="secondary" onClick={() => onOpenTool(tool.id)}>
                Open {tool.title}
              </button>
            ) : (
              <button className="secondary" onClick={() => window.open(tool.url, "_blank", "noopener,noreferrer")}>
                Open {tool.title}
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function RatingPanel({ courses, progress }) {
  const rows = [...(progress?.lessonActivity || [])].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  return (
    <section className="card" data-aos="fade-up">
      <div className="dashboardCardTitle">
        <ThreeDIcon name="rating" />
        <div>
          <h2>Rating</h2>
          <p className="hint">Detailed lesson points.</p>
        </div>
      </div>
      <div className="tableWrap">
        <table className="dataTable">
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Video</th>
              <th>Learning</th>
              <th>Task</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={lessonIdentity(item)}>
                <td>{resolveLessonTitle(courses, item)}</td>
                <td>{item.videoCompleted ? 10 : 0}</td>
                <td>{item.learningCompleted ? 10 : 0}</td>
                <td>{item.taskCompleted ? 10 : 0}</td>
                <td>{lessonPoints(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StudentDashboard({
  token,
  user,
  courses,
  progress,
  myTeachers,
  selectedProgramId,
  selectedProgram,
  selectedLevel,
  studentAssignments,
  practiceTests,
  onSelectProgram,
  onSelectLevel,
  onOpenPractice,
  onSubmitPracticeScore,
  onSaveProfile,
  onCompleteLesson,
  onSubmitTopicScore,
  onSaveLessonActivity,
  onLogout
}) {
  const [tab, setTab] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [lessonPageOpen, setLessonPageOpen] = useState(false);
  const [activeToolId, setActiveToolId] = useState("");

  useEffect(() => {
    if (tab !== "tests" || practiceTests.length > 0 || !selectedProgram) return;
    onOpenPractice(selectedProgram.id);
  }, [onOpenPractice, practiceTests.length, selectedProgram, tab]);

  useEffect(() => {
    if (tab !== "lessons") {
      setLessonPageOpen(false);
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "tools") {
      setActiveToolId("");
    }
  }, [tab]);

  const navItems = [
    { id: "home", label: "Home", iconName: "home" },
    { id: "lessons", label: "Lessons", iconName: "lessons" },
    { id: "tests", label: "Previous Tests", iconName: "tests" },
    { id: "practice-tests", label: "Practice Tests", iconName: "practice-tests" },
    { id: "tools", label: "Tools", iconName: "tools" },
    { id: "rating", label: "Rating", iconName: "rating" },
    { id: "teachers", label: "Teachers", iconName: "teachers" },
    { id: "chat", label: "Chat", iconName: "chat" },
    { id: "profile", label: "Profile", iconName: "profile" }
  ];

  const currentTabLabel = useMemo(
    () => navItems.find((item) => item.id === tab)?.label || "Home",
    [tab]
  );
  const generatedPracticeTests = useMemo(() => buildBluebookTests(selectedProgram?.id), [selectedProgram?.id]);

  const profileLabel = user.profile?.firstName || user.name;

  return (
    <div className={collapsed ? "dashboardShell collapsed" : "dashboardShell"}>
      <aside className="dashboardSidebar" data-aos="fade-right">
        <button className="dashboardMenuButton" onClick={() => setCollapsed((current) => !current)}>
          <TwoDIcon name="menu" />
          {!collapsed && <span>Menu</span>}
        </button>

        <div className={collapsed ? "dashboardBrand hidden" : "dashboardBrand"}>
          <p className="eyebrow">Learnova</p>
          <strong>Student</strong>
        </div>

        <nav className="dashboardNav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "dashboardNavItem active" : "dashboardNavItem"}
              onClick={() => setTab(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <TwoDIcon name={item.iconName} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="dashboardContent">
        <div className="dashboardContentTopbar" data-aos="fade-down">
          <div>
            <p className="eyebrow">Student space</p>
            <h2>{currentTabLabel}</h2>
          </div>
          <button className="profileTopButton" onClick={() => setTab("profile")}>
            {user.profile?.profilePicture ? (
              <img className="profileTopAvatar" src={user.profile.profilePicture} alt={user.name} />
            ) : (
              <span className="profileTopAvatar profileTopPlaceholder">{user.name?.slice(0, 1) || "U"}</span>
            )}
            <span>{profileLabel}</span>
          </button>
        </div>

        {tab === "home" && <StudentHome user={user} courses={courses} progress={progress} myTeachers={myTeachers} onOpenTab={setTab} />}

        {tab === "lessons" && (
          <div className="stack">
            {!lessonPageOpen && (
              <CourseCatalog
                courses={courses}
                selectedProgramId={selectedProgramId}
                selectedLevelId={selectedLevel?.id}
                assignments={studentAssignments}
                onSelectProgram={onSelectProgram}
                onSelectLevel={(programId, levelId) => {
                  onSelectLevel(programId, levelId);
                  setLessonPageOpen(true);
                }}
                onOpenPractice={onOpenPractice}
              />
            )}

            {lessonPageOpen && selectedProgram && selectedLevel && (
              <>
                <div className="inline" data-aos="fade-right">
                  <button className="ghost" onClick={() => setLessonPageOpen(false)}>
                    Back to course levels
                  </button>
                </div>
                <LessonViewer
                  program={selectedProgram}
                  level={selectedLevel}
                  progress={progress}
                  onCompleteLesson={onCompleteLesson}
                  onSubmitTopicScore={onSubmitTopicScore}
                  onSaveLessonActivity={onSaveLessonActivity}
                />
              </>
            )}
          </div>
        )}

        {tab === "tests" && selectedProgram && (
          <PracticeTest
            programTitle={selectedProgram.title}
            tests={practiceTests}
            variant="previous"
            onSubmitScore={onSubmitPracticeScore}
          />
        )}

        {tab === "practice-tests" && selectedProgram && (
          <PracticeTest
            programTitle={selectedProgram.title}
            tests={generatedPracticeTests}
            variant="practice"
            onSubmitScore={onSubmitPracticeScore}
          />
        )}

        {tab === "tools" && (
          <InternalToolsPanel
            assignments={studentAssignments}
            activeToolId={activeToolId}
            onOpenTool={setActiveToolId}
            onBack={() => setActiveToolId("")}
          />
        )}
        {tab === "rating" && <RatingPanel courses={courses} progress={progress} />}
        {tab === "teachers" && <TeacherDirectory teachers={myTeachers} />}
        {tab === "chat" && <ChatPanel token={token} user={user} assignments={studentAssignments} teachers={myTeachers} />}
        {tab === "profile" && <ProfilePanel user={user} onSave={onSaveProfile} onLogout={onLogout} />}
      </div>
    </div>
  );
}
