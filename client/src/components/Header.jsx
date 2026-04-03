export default function Header({ user, onLogout }) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Learnova</p>
        <h1>SAT + IELTS Study Platform</h1>
        <p className="subtext">
          Structured study paths, teacher assignment, searchable admin records, and program-based chat.
        </p>
      </div>
      {user && (
        <div className="userBox">
          {user.profile?.profilePicture ? (
            <img className="avatar" src={user.profile.profilePicture} alt={user.name} />
          ) : (
            <div className="avatar placeholder">{user.name?.slice(0, 1) || "U"}</div>
          )}
          <p>{user.name}</p>
          <small>{user.role}</small>
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </header>
  );
}
