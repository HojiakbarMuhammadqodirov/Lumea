import { useEffect, useRef, useState } from "react";

const PHOTO_NAMES = [
  "IELTS9.png",
  "harvard.png",
  "stanford.png",
  "mit.png",
  "princeton.png",
  "duke.png",
  "yale.png"
];

const POSITION_PRESETS = [
  { left: 8, top: 16 },
  { left: 20, top: 30 },
  { left: 12, top: 58 },
  { left: 30, top: 72 },
  { left: 42, top: 18 },
  { left: 50, top: 44 },
  { left: 62, top: 68 },
  { left: 72, top: 20 },
  { left: 82, top: 38 },
  { left: 76, top: 72 },
  { left: 58, top: 84 }
];

const FADE_MS = 2000;
const HOLD_MS = 3000;
const LIFE_MS = FADE_MS * 2 + HOLD_MS;
const COOLDOWN_MS = 20000;
const TARGET_VISIBLE = 3;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function isFarEnough(candidate, usedPositions) {
  return !usedPositions.some((used) => {
    const leftGap = Math.abs(used.left - candidate.left);
    const topGap = Math.abs(used.top - candidate.top);
    return leftGap < 18 && topGap < 18;
  });
}

function createPosition(usedPositions) {
  const preset = shuffle(POSITION_PRESETS).find((item) => isFarEnough(item, usedPositions));

  if (!preset) {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const candidate = {
        left: clamp(10 + Math.random() * 74, 8, 84),
        top: clamp(14 + Math.random() * 68, 12, 84)
      };

      if (isFarEnough(candidate, usedPositions)) {
        return candidate;
      }
    }

    return {
      left: clamp(10 + Math.random() * 74, 8, 84),
      top: clamp(14 + Math.random() * 68, 12, 84)
    };
  }

  const variedPreset = {
    left: clamp(preset.left + (Math.random() * 6 - 3), 8, 84),
    top: clamp(preset.top + (Math.random() * 6 - 3), 12, 84)
  };

  if (isFarEnough(variedPreset, usedPositions)) {
    return variedPreset;
  }

  return {
    left: preset.left,
    top: preset.top
  };
}

export default function FloatingBackgroundPhotos() {
  const [items, setItems] = useState([]);
  const [availablePhotos, setAvailablePhotos] = useState([]);
  const timeoutsRef = useRef([]);
  const cooldownRef = useRef(new Map());
  const itemsRef = useRef([]);
  const pendingSourcesRef = useRef(new Set());

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      PHOTO_NAMES.map(
        (name) =>
          new Promise((resolve) => {
            const img = new Image();
            const src = `/images/backgroundPhotos/${name}`;

            img.onload = () => resolve({ src, alt: name.replace(/\.[^.]+$/, "") });
            img.onerror = () => resolve(null);
            img.src = src;
          })
      )
    ).then((results) => {
      if (cancelled) return;
      setAvailablePhotos(results.filter(Boolean));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!availablePhotos.length) return;

    const scheduleTimeout = (callback, delay) => {
      const timeoutId = window.setTimeout(callback, delay);
      timeoutsRef.current.push(timeoutId);
    };

    const spawnPhoto = () => {
      const now = Date.now();
      const currentItems = itemsRef.current;
      const activeSources = new Set(currentItems.map((item) => item.src));
      const candidates = availablePhotos.filter((photo) => {
        const availableAt = cooldownRef.current.get(photo.src) || 0;
        return availableAt <= now && !activeSources.has(photo.src) && !pendingSourcesRef.current.has(photo.src);
      });

      if (!candidates.length) return;

      const photo = candidates[Math.floor(Math.random() * candidates.length)];
      const position = createPosition(currentItems);
      const id = `${photo.src}-${now}-${Math.random().toString(16).slice(2)}`;
      pendingSourcesRef.current.add(photo.src);

      setItems((current) => {
        const nextItems = [...current, { ...photo, ...position, id, visible: false }];
        itemsRef.current = nextItems;
        return nextItems;
      });

      scheduleTimeout(() => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, visible: true } : item)));
      }, 40);

      scheduleTimeout(() => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, visible: false } : item)));
      }, FADE_MS + HOLD_MS);

      scheduleTimeout(() => {
        cooldownRef.current.set(photo.src, Date.now() + COOLDOWN_MS);
        pendingSourcesRef.current.delete(photo.src);
        setItems((current) => {
          const nextItems = current.filter((item) => item.id !== id);
          itemsRef.current = nextItems;
          return nextItems;
        });
      }, LIFE_MS);
    };

    const ensureCoverage = () => {
      const desiredCount = Math.min(TARGET_VISIBLE, availablePhotos.length);
      const missingCount = desiredCount - itemsRef.current.length;

      for (let index = 0; index < missingCount; index += 1) {
        spawnPhoto();
      }
    };

    ensureCoverage();
    const intervalId = window.setInterval(ensureCoverage, 1200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [availablePhotos]);

  if (!availablePhotos.length) {
    return null;
  }

  return (
    <div className="floatingBackgroundPhotos" aria-hidden="true">
      {items.map((item) => (
        <img
          key={item.id}
          className={item.visible ? "floatingBackgroundPhoto visible" : "floatingBackgroundPhoto"}
          src={item.src}
          alt=""
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
        />
      ))}
    </div>
  );
}
