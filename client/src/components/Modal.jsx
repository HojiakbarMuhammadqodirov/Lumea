export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className={wide ? "modalCard wide" : "modalCard"} onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>{title}</h3>
          <button className="iconButton" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
