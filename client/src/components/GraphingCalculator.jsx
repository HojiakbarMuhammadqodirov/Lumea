import { useEffect, useMemo, useRef, useState } from "react";

const defaultDomain = 10;
const defaultCenter = { x: 0, y: 0 };
const expressionColors = ["#2d70b3", "#c74440", "#388c46", "#6042a6", "#fa7e19", "#2a9d8f"];

const keyboardRows = [
  ["x", "y", "a^2", "a^b"],
  ["(", ")", "<", ">"],
  ["|a|", ",", "<=", ">="],
  ["ABC", "pi", "sqrt(", "Backspace"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"]
];

const builtins = {
  sin: "Math.sin",
  cos: "Math.cos",
  tan: "Math.tan",
  sqrt: "Math.sqrt",
  abs: "Math.abs",
  log: "Math.log10",
  ln: "Math.log",
  exp: "Math.exp",
  pi: "Math.PI",
  e: "Math.E"
};

const reservedNames = new Set(["x", "sin", "cos", "tan", "sqrt", "abs", "log", "ln", "exp", "pi", "e"]);

const symbolTokenMap = {
  "a^2": "^2",
  "a^b": "^",
  "|a|": "abs(",
  ABC: "",
  pi: "pi",
  "<=": "<=",
  ">=": ">="
};

const makeExpression = (index = 0) => ({
  id: `expr-${Date.now()}-${index}`,
  value: "",
  color: expressionColors[index % expressionColors.length]
});

const niceStep = (rawStep) => {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;

  const exponent = Math.floor(Math.log10(rawStep));
  const fraction = rawStep / 10 ** exponent;

  if (fraction <= 1) return 1 * 10 ** exponent;
  if (fraction <= 2) return 2 * 10 ** exponent;
  if (fraction <= 5) return 5 * 10 ** exponent;
  return 10 * 10 ** exponent;
};

const formatTick = (value) => {
  if (Math.abs(value) < 1e-10) return "0";

  const abs = Math.abs(value);
  if (abs >= 1000 || abs < 0.01) {
    return value.toExponential(0).replace("+", "");
  }

  return Number(value.toFixed(8)).toString();
};

const normalizeExpression = (value) =>
  value
    .replace(/^y\s*=/i, "")
    .replace(/\s+/g, "")
    .replace(/\^/g, "**")
    .replace(/(\d)([a-z(])/gi, "$1*$2")
    .replace(/([a-z)])(\d)/gi, "$1*$2")
    .replace(/\)([a-z])/gi, ")*$1")
    .replace(/([a-z])\(/gi, "$1*(")
    .replace(/\b(sin|cos|tan|sqrt|abs|log|ln|exp|pi|e)\b/gi, (match) => builtins[match.toLowerCase()] || match);

const extractVariables = (value) => {
  const matches = value.match(/[a-z]+/gi) || [];
  return [...new Set(matches.map((item) => item.toLowerCase()).filter((item) => !reservedNames.has(item)))];
};

const buildEvaluator = (value, sliders) => {
  const prepared = normalizeExpression(value);

  if (!prepared || prepared === "=" || /[+\-*/^(~=,\[\]<>]$/.test(prepared)) {
    return { fn: () => null, valid: false, variables: [] };
  }

  const variables = extractVariables(value);

  try {
    const fn = new Function("x", "vars", `with (vars) { return ${prepared}; }`);
    return {
      valid: true,
      variables,
      fn: (x) => {
        try {
          const result = fn(x, sliders);
          return Number.isFinite(result) ? result : null;
        } catch {
          return null;
        }
      }
    };
  } catch {
    return { fn: () => null, valid: false, variables };
  }
};

const buildTicks = (domain, center, width, height) => {
  const spanX = domain * 2;
  const spanY = spanX * (height / width);
  const minX = center.x - domain;
  const maxX = center.x + domain;
  const minY = center.y - spanY / 2;
  const maxY = center.y + spanY / 2;

  const majorX = [];
  const majorY = [];
  const minorX = [];
  const minorY = [];

  const majorStepX = niceStep(spanX / Math.max(4, Math.round(width / 140)));
  const majorStepY = niceStep(spanY / Math.max(4, Math.round(height / 100)));
  const minorStepX = majorStepX / 5;
  const minorStepY = majorStepY / 5;

  const toX = (x) => ((x - minX) / spanX) * width;
  const toY = (y) => ((maxY - y) / spanY) * height;

  const startX = Math.floor(minX / minorStepX) * minorStepX;
  const endX = Math.ceil(maxX / minorStepX) * minorStepX;
  const startY = Math.floor(minY / minorStepY) * minorStepY;
  const endY = Math.ceil(maxY / minorStepY) * minorStepY;

  for (let value = startX; value <= endX + minorStepX / 2; value += minorStepX) {
    const fixed = Number(value.toPrecision(12));
    if (fixed < minX - 0.0001 || fixed > maxX + 0.0001) continue;
    const entry = { value: fixed, x: toX(fixed) };
    if (Math.abs(fixed / majorStepX - Math.round(fixed / majorStepX)) < 0.0001) {
      majorX.push(entry);
    } else {
      minorX.push(entry);
    }
  }

  for (let value = startY; value <= endY + minorStepY / 2; value += minorStepY) {
    const fixed = Number(value.toPrecision(12));
    if (fixed < minY - 0.0001 || fixed > maxY + 0.0001) continue;
    const entry = { value: fixed, y: toY(fixed) };
    if (Math.abs(fixed / majorStepY - Math.round(fixed / majorStepY)) < 0.0001) {
      majorY.push(entry);
    } else {
      minorY.push(entry);
    }
  }

  return { majorX, majorY, minorX, minorY, minX, maxX, minY, maxY, spanX, spanY, toX, toY };
};

const buildPath = (value, ticks, sliders) => {
  const evaluator = buildEvaluator(value, sliders);
  if (!evaluator.valid) return "";

  const step = ticks.spanX / 420;
  const points = [];

  for (let x = ticks.minX; x <= ticks.maxX; x += step) {
    const y = evaluator.fn(x);
    if (y === null || y < ticks.minY - ticks.spanY || y > ticks.maxY + ticks.spanY) {
      points.push(null);
      continue;
    }
    points.push([ticks.toX(x), ticks.toY(y)]);
  }

  return points.reduce((path, point, index) => {
    if (!point) return path;
    const command = !points[index - 1] ? "M" : "L";
    return `${path}${command}${point[0].toFixed(2)} ${point[1].toFixed(2)} `;
  }, "");
};

export default function GraphingCalculator({ onBack }) {
  const [domain, setDomain] = useState(defaultDomain);
  const [center, setCenter] = useState(defaultCenter);
  const [expressions, setExpressions] = useState([makeExpression(0), makeExpression(1)]);
  const [activeExpressionId, setActiveExpressionId] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [sliders, setSliders] = useState({});
  const [graphSize, setGraphSize] = useState({ width: 900, height: 560 });
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);

  const graphRef = useRef(null);
  const inputRefs = useRef({});
  const dragRef = useRef(null);
  const selectionRef = useRef({});

  useEffect(() => {
    if (!graphRef.current) return undefined;

    const node = graphRef.current;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setGraphSize({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(280, Math.floor(rect.height))
      });
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!expressions.length || activeExpressionId) return;

    const firstId = expressions[0].id;
    setActiveExpressionId(firstId);
    requestAnimationFrame(() => inputRefs.current[firstId]?.focus());
  }, [activeExpressionId, expressions]);

  const activeId = activeExpressionId || expressions[0]?.id || "";

  const allVariables = useMemo(() => {
    const found = new Set();
    expressions.forEach((expression) => {
      extractVariables(expression.value).forEach((item) => found.add(item));
    });
    return [...found];
  }, [expressions]);

  useEffect(() => {
    setSliders((current) => {
      const next = { ...current };
      allVariables.forEach((item) => {
        if (!(item in next)) next[item] = 1;
      });
      Object.keys(next).forEach((item) => {
        if (!allVariables.includes(item)) delete next[item];
      });
      return next;
    });
  }, [allVariables]);

  const ticks = useMemo(
    () => buildTicks(domain, center, graphSize.width, graphSize.height),
    [center, domain, graphSize.height, graphSize.width]
  );

  const plottedExpressions = useMemo(
    () =>
      expressions
        .filter((expression) => expression.value.trim())
        .map((expression) => {
          const evaluation = buildEvaluator(expression.value, sliders);
          return {
            ...expression,
            valid: evaluation.valid,
            path: buildPath(expression.value, ticks, sliders)
          };
        }),
    [expressions, sliders, ticks]
  );

  const snapshotExpressions = (rows) => rows.map((row) => ({ ...row }));

  const focusExpression = (id) => {
    if (!id) return;

    setActiveExpressionId(id);
    requestAnimationFrame(() => {
      const input = inputRefs.current[id];
      if (!input) return;

      input.focus();
      const selection = selectionRef.current[id];
      const cursor = selection?.end ?? input.value.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  const setCaretPosition = (id, start, end = start) => {
    selectionRef.current[id] = { start, end };
    requestAnimationFrame(() => {
      const input = inputRefs.current[id];
      if (!input) return;
      input.focus();
      input.setSelectionRange(start, end);
    });
  };

  const pushHistory = (rows) => {
    setHistory((current) => [...current.slice(-49), snapshotExpressions(rows)]);
    setRedoHistory([]);
  };

  const addExpressionRow = () => {
    setExpressions((current) => {
      pushHistory(current);
      const next = [...current, makeExpression(current.length)];
      const newId = next[next.length - 1].id;
      requestAnimationFrame(() => focusExpression(newId));
      return next;
    });
  };

  const updateExpression = (id, nextValue) => {
    const cleaned = nextValue.replace(/^y\s*=/i, "");
    setExpressions((current) => current.map((item) => (item.id === id ? { ...item, value: cleaned } : item)));
  };

  const commitExpressionChange = (id, nextValue) => {
    setExpressions((current) => {
      pushHistory(current);
      const cleaned = nextValue.replace(/^y\s*=/i, "");
      return current.map((item) => (item.id === id ? { ...item, value: cleaned } : item));
    });
  };

  const removeExpression = (id) => {
    setExpressions((current) => {
      pushHistory(current);
      const next = current.filter((item) => item.id !== id);
      if (!next.length) {
        const fallback = [makeExpression(0)];
        requestAnimationFrame(() => focusExpression(fallback[0].id));
        return fallback;
      }
      requestAnimationFrame(() => focusExpression(next[Math.max(0, next.length - 1)].id));
      return next;
    });
  };

  const insertToken = (token) => {
    if (!activeId) return;

    if (token === "ABC") {
      focusExpression(activeId);
      return;
    }

    if (token === "Enter") {
      addExpressionRow();
      return;
    }

    const current = expressions.find((item) => item.id === activeId);
    if (!current) return;

    const selection = selectionRef.current[activeId] ?? {
      start: current.value.length,
      end: current.value.length
    };

    const start = Math.min(selection.start, selection.end);
    const end = Math.max(selection.start, selection.end);

    if (token === "Backspace") {
      if (start !== end) {
        const nextValue = `${current.value.slice(0, start)}${current.value.slice(end)}`;
        commitExpressionChange(activeId, nextValue);
        setCaretPosition(activeId, start);
        return;
      }

      if (start === 0) return;

      const nextValue = `${current.value.slice(0, start - 1)}${current.value.slice(end)}`;
      commitExpressionChange(activeId, nextValue);
      setCaretPosition(activeId, start - 1);
      return;
    }

    if (token === "Left") {
      setCaretPosition(activeId, Math.max(0, start - 1));
      return;
    }

    if (token === "Right") {
      setCaretPosition(activeId, Math.min(current.value.length, end + 1));
      return;
    }

    const insertable = symbolTokenMap[token] ?? token;
    const nextValue = `${current.value.slice(0, start)}${insertable}${current.value.slice(end)}`;
    const nextCursor = start + insertable.length;
    commitExpressionChange(activeId, nextValue);
    setCaretPosition(activeId, nextCursor);
  };

  const handleUndo = () => {
    setHistory((current) => {
      if (!current.length) return current;
      const previous = current[current.length - 1];
      setRedoHistory((redoCurrent) => [...redoCurrent, snapshotExpressions(expressions)]);
      setExpressions(snapshotExpressions(previous));
      requestAnimationFrame(() => focusExpression(previous[0]?.id || ""));
      return current.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoHistory((current) => {
      if (!current.length) return current;
      const next = current[current.length - 1];
      setHistory((historyCurrent) => [...historyCurrent.slice(-49), snapshotExpressions(expressions)]);
      setExpressions(snapshotExpressions(next));
      requestAnimationFrame(() => focusExpression(next[0]?.id || ""));
      return current.slice(0, -1);
    });
  };

  const zoomTo = (factor) => {
    setDomain((current) => {
      const next = current * factor;
      return Math.min(5000, Math.max(0.002, Number(next.toPrecision(6))));
    });
  };

  const handleWheelZoom = (event) => {
    event.preventDefault();
    zoomTo(event.deltaY > 0 ? 1.15 : 1 / 1.15);
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      center
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;

    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    const unitsPerPixelX = ticks.spanX / graphSize.width;
    const unitsPerPixelY = ticks.spanY / graphSize.height;

    setCenter({
      x: Number((dragRef.current.center.x - dx * unitsPerPixelX).toPrecision(8)),
      y: Number((dragRef.current.center.y + dy * unitsPerPixelY).toPrecision(8))
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <section className="desmosScreen" data-aos="fade-up">
      <div className="desmosTopbar">
        <div className="desmosTopbarLeft">
          <button className="desmosTopIconButton" type="button" onClick={addExpressionRow} aria-label="Add expression">
            +
          </button>
          <button className="desmosTopIconButton" type="button" onClick={handleUndo} aria-label="Undo">
            ↶
          </button>
          <button className="desmosTopIconButton" type="button" onClick={handleRedo} aria-label="Redo">
            ↷
          </button>
        </div>

        <div className="desmosTopbarRight">
          <button className="desmosTopTextButton" type="button" onClick={onBack}>
            Exit
          </button>
          <button className="desmosTopIconButton" type="button" aria-label="Settings">
            ⚙
          </button>
        </div>
      </div>

      <div className="desmosMain">
        <aside className="desmosExpressionsPane">
          <div className="desmosExpressionsList">
            {expressions.map((expression, index) => {
              const state = buildEvaluator(expression.value, sliders);
              return (
                <div
                  className="desmosExpressionLine"
                  key={expression.id}
                  onClick={() => focusExpression(expression.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      focusExpression(expression.id);
                    }
                  }}
                >
                  <button
                    type="button"
                    className={activeId === expression.id ? "desmosExpressionNumber active" : "desmosExpressionNumber"}
                    onClick={() => focusExpression(expression.id)}
                  >
                    {index + 1}
                  </button>

                  {expression.value.trim() && state.valid ? (
                    <span className="desmosExpressionDot active" style={{ background: expression.color }} />
                  ) : (
                    <span className="desmosExpressionDot" />
                  )}

                  <input
                    ref={(node) => {
                      inputRefs.current[expression.id] = node;
                    }}
                    className="desmosFormulaInput"
                    placeholder={index === 0 ? "Type an expression like y=x^2" : ""}
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    value={expression.value}
                    onClick={(event) => {
                      event.stopPropagation();
                      focusExpression(expression.id);
                    }}
                    onFocus={(event) => {
                      setActiveExpressionId(expression.id);
                      selectionRef.current[expression.id] = {
                        start: event.target.selectionStart ?? event.target.value.length,
                        end: event.target.selectionEnd ?? event.target.value.length
                      };
                    }}
                    onSelect={(event) => {
                      selectionRef.current[expression.id] = {
                        start: event.target.selectionStart ?? 0,
                        end: event.target.selectionEnd ?? 0
                      };
                    }}
                    onChange={(event) => updateExpression(expression.id, event.target.value)}
                    onKeyUp={(event) => {
                      selectionRef.current[expression.id] = {
                        start: event.currentTarget.selectionStart ?? 0,
                        end: event.currentTarget.selectionEnd ?? 0
                      };
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addExpressionRow();
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="desmosClearButton"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeExpression(expression.id);
                    }}
                    aria-label="Delete expression"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {allVariables.length > 0 && (
              <div className="desmosSliderPanel">
                <p>Add slider:</p>
                {allVariables.map((name) => (
                  <div key={name} className="desmosSliderRow">
                    <span>{name}</span>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.1"
                      value={sliders[name] ?? 1}
                      onChange={(event) =>
                        setSliders((current) => ({
                          ...current,
                          [name]: Number(event.target.value)
                        }))
                      }
                    />
                    <strong>{Number(sliders[name] ?? 1).toFixed(1)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div
          className={isDragging ? "desmosGraphArea dragging" : "desmosGraphArea"}
          ref={graphRef}
          onWheel={handleWheelZoom}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <svg viewBox={`0 0 ${graphSize.width} ${graphSize.height}`} className="desmosGraphSvg" role="img" aria-label="Graphing calculator">
            {ticks.minorX.map((tick) => (
              <line key={`minor-x-${tick.value}`} x1={tick.x} y1="0" x2={tick.x} y2={graphSize.height} className="desmosMinorGridLine" />
            ))}

            {ticks.minorY.map((tick) => (
              <line key={`minor-y-${tick.value}`} x1="0" y1={tick.y} x2={graphSize.width} y2={tick.y} className="desmosMinorGridLine" />
            ))}

            {ticks.majorX.map((tick) => (
              <line key={`major-x-${tick.value}`} x1={tick.x} y1="0" x2={tick.x} y2={graphSize.height} className="desmosMajorGridLine" />
            ))}

            {ticks.majorY.map((tick) => (
              <line key={`major-y-${tick.value}`} x1="0" y1={tick.y} x2={graphSize.width} y2={tick.y} className="desmosMajorGridLine" />
            ))}

            {ticks.minX <= 0 && ticks.maxX >= 0 && (
              <line x1={ticks.toX(0)} y1="0" x2={ticks.toX(0)} y2={graphSize.height} className="desmosAxisLine" />
            )}

            {ticks.minY <= 0 && ticks.maxY >= 0 && (
              <line x1="0" y1={ticks.toY(0)} x2={graphSize.width} y2={ticks.toY(0)} className="desmosAxisLine" />
            )}

            {ticks.majorX.map((tick) =>
              tick.value !== 0 && ticks.minY <= 0 && ticks.maxY >= 0 ? (
                <text key={`xlabel-${tick.value}`} x={tick.x + 4} y={ticks.toY(0) + 18} className="desmosAxisLabel">
                  {formatTick(tick.value)}
                </text>
              ) : null
            )}

            {ticks.majorY.map((tick) =>
              tick.value !== 0 && ticks.minX <= 0 && ticks.maxX >= 0 ? (
                <text key={`ylabel-${tick.value}`} x={ticks.toX(0) + 6} y={tick.y - 6} className="desmosAxisLabel">
                  {formatTick(tick.value)}
                </text>
              ) : null
            )}

            {ticks.minX <= 0 && ticks.maxX >= 0 && ticks.minY <= 0 && ticks.maxY >= 0 && (
              <text x={ticks.toX(0) + 6} y={ticks.toY(0) + 18} className="desmosAxisLabel">
                0
              </text>
            )}

            {plottedExpressions.map((expression) =>
              expression.path ? (
                <path key={expression.id} d={expression.path} fill="none" stroke={expression.color} strokeWidth="3" strokeLinecap="round" />
              ) : null
            )}
          </svg>

          <div className="desmosFloatingTools">
            <button className="desmosFloatButton" type="button" aria-label="Tools">
              🔧
            </button>
            <button className="desmosFloatButton" type="button" aria-label="Zoom in" onClick={() => zoomTo(1 / 2)}>
              +
            </button>
            <button className="desmosFloatButton" type="button" aria-label="Zoom out" onClick={() => zoomTo(2)}>
              −
            </button>
          </div>
        </div>
      </div>

      <div className="desmosKeyboardDock">
        <button className="desmosKeyboardToggle" type="button" onClick={() => setKeyboardOpen((current) => !current)}>
          <span>⌨</span>
          <span>{keyboardOpen ? "▾" : "▴"}</span>
        </button>
      </div>

      {keyboardOpen && (
        <div className="desmosKeyboardPanel">
          <div className="desmosKeyboardLayout">
            <div className="desmosKeyboardCluster">
              {keyboardRows.slice(0, 4).map((row, rowIndex) => (
                <div className="desmosKeyboardRow" key={`left-${rowIndex}`}>
                  {row.map((token) => (
                    <button key={token} type="button" className="desmosKeyButton light" onClick={() => insertToken(token)}>
                      {token === "Backspace" ? "⌫" : token}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="desmosKeyboardCluster">
              {keyboardRows.slice(4).map((row, rowIndex) => (
                <div className="desmosKeyboardRow" key={`right-${rowIndex}`}>
                  {row.map((token) => (
                    <button key={token} type="button" className="desmosKeyButton dark" onClick={() => insertToken(token)}>
                      {token}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="desmosKeyboardUtility">
              <button type="button" className="desmosFunctionButton">
                Functions
              </button>
              <div className="desmosArrowRow">
                <button type="button" className="desmosKeyButton utility" onClick={() => insertToken("Left")}>
                  ←
                </button>
                <button type="button" className="desmosKeyButton utility" onClick={() => insertToken("Right")}>
                  →
                </button>
              </div>
              <button type="button" className="desmosKeyButton utility" onClick={() => insertToken("Backspace")}>
                ⌫
              </button>
              <button type="button" className="desmosKeyButton enter" onClick={() => insertToken("Enter")}>
                ↵
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
