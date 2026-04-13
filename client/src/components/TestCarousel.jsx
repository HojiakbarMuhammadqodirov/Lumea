import { useRef, useState } from "react";

/**
 * Infinite auto-scrolling test carousel.
 *
 * Props
 *   items   – array of test objects
 *   renderCard(item, onClick) – returns JSX for a single card
 *   onCardClick(item) – called when a card is clicked
 *   speed   – px/s, default 80
 *   accent  – CSS colour used for the fade-edge gradient, default "#F6FAFF"
 */
export default function TestCarousel({ items, renderCard, onCardClick, speed = 80, accent = "#F6FAFF" }) {
  // Duplicate 3× so we always have items in view after any drag offset
  const tripled = [...items, ...items, ...items];

  const trackRef   = useRef(null);
  const outerRef   = useRef(null);
  const [paused, setPaused] = useState(false);

  // Drag-to-scroll
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e) => {
    const track = trackRef.current;
    drag.current = { active: true, startX: e.pageX - track.offsetLeft, scrollLeft: track.scrollLeft };
    setPaused(true);
  };

  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const x    = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.4;
    // We mirror via CSS animation so manipulate via style instead
    trackRef.current.style.setProperty("--drag-offset", `${-walk}px`);
  };

  const onMouseUp = () => {
    drag.current.active = false;
    // Let animation resume after short pause so user sees where they stopped
    setTimeout(() => setPaused(false), 600);
  };

  // Total animation duration = (one copy width in px) / speed
  // We set it via CSS custom property so the animation speed adapts when
  // the user changes speed prop. We approximate card width × item count.
  const CARD_W = 190; // px, matches CSS .tcCard width
  const GAP    = 14;
  const oneSetPx = items.length * (CARD_W + GAP);
  const dur    = (oneSetPx / speed).toFixed(1);

  return (
    <div
      ref={outerRef}
      className="tcOuter"
      style={{ "--accent": accent, "--dur": `${dur}s` }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        ref={trackRef}
        className={`tcTrack${paused ? " tcPaused" : ""}`}
      >
        {tripled.map((item, i) => (
          <div key={`${item.id}-${i}`} className="tcCardWrap">
            {renderCard(item, () => onCardClick?.(item))}
          </div>
        ))}
      </div>
    </div>
  );
}
