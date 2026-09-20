import { useEffect, useMemo, useRef, useState } from "react";
import { inr, moodOf, shortDate, yearSpan } from "../lib/format";

/* ---------- Map geometry (SVG units) ---------- */
const W = 1400;
const H = 460;
const LEFT = 44;
const RIGHT = 30;
const T0 = Date.parse("2013-07-01");
const T1 = Date.parse("2025-01-01");
const LANES = { music: [72, 178], money: [218, 308], card: [348, 412] };
const GROUP_OF = { music: "music", purchase: "money", income: "money", card: "card" };
const GROUP_LABEL = { music: "Music", money: "Household money", card: "Card" };
const TYPE_COLOR = { music: "#8ec5ff", purchase: "#ffd166", income: "#7bd88f", card: "#ff9f80" };
const TYPE_NAME = { music: "Music", purchase: "Purchase", income: "Income", card: "Card" };
const KIND_LABEL = { arc: "Part of a story", theme: "Same theme", time: "Close in time" };
const KIND_ORDER = { arc: 0, theme: 1, time: 2 };
const START_ID = "m-day-2017-09-06"; // the 1,816-plays day: a good place to begin

const xOf = (iso) => LEFT + ((Date.parse(iso) - T0) / (T1 - T0)) * (W - LEFT - RIGHT);
const hash01 = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
};

function Toggle({ checked, onChange, children }) {
  return (
    <label className="chip">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}

export default function Connections({ chapters, moments, links, insights }) {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState(new Set(["music", "money", "card"]));
  const [kinds, setKinds] = useState(new Set(["arc", "theme", "time"]));
  const [sel, setSel] = useState(() =>
    moments.some((m) => m.id === START_ID) ? { type: "node", id: START_ID } : null
  );
  const [listLimit, setListLimit] = useState(12);
  const detailRef = useRef(null);
  const scrollRef = useRef(null);
  const [filtersOpen] = useState(() => typeof window === "undefined" || window.innerWidth >= 900);

  const toggle = (set, setter, key) => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    setter(next);
  };

  /* ---------- Derived data ---------- */
  const base = useMemo(() => {
    const nodes = moments.filter((m) => m.type !== "milestone");
    const byId = new Map(nodes.map((m) => [m.id, m]));
    const pos = new Map(
      nodes.map((m) => {
        const [y0, y1] = LANES[GROUP_OF[m.type]];
        return [m.id, { x: xOf(m.t), y: y0 + hash01(m.id) * (y1 - y0) }];
      })
    );
    const adj = new Map(nodes.map((m) => [m.id, []]));
    const validLinks = links.filter((l) => byId.has(l.a) && byId.has(l.b));
    validLinks.forEach((l) => {
      adj.get(l.a).push({ id: l.b, link: l });
      adj.get(l.b).push({ id: l.a, link: l });
    });
    const chapterById = new Map(chapters.map((c) => [c.id, c]));
    const threads = insights.filter((i) => i.moments.filter((id) => byId.has(id)).length >= 2);
    return { nodes, byId, pos, adj, validLinks, chapterById, threads };
  }, [moments, links, chapters, insights]);

  const visible = useMemo(
    () => new Set(base.nodes.filter((m) => groups.has(GROUP_OF[m.type])).map((m) => m.id)),
    [base, groups]
  );
  const shownLinks = useMemo(
    () => base.validLinks.filter((l) => kinds.has(l.kind) && visible.has(l.a) && visible.has(l.b)),
    [base, kinds, visible]
  );

  const q = query.trim().toLowerCase();
  const matches = (m) => !q || `${m.title} ${m.sub ?? ""} ${m.tags.join(" ")}`.toLowerCase().includes(q);

  // What is highlighted right now: a receipt and its neighbours, or a whole story thread.
  const focus = useMemo(() => {
    if (!sel) return null;
    if (sel.type === "node") {
      const ids = new Set([sel.id]);
      base.adj.get(sel.id)?.forEach((n) => ids.add(n.id));
      return { ids, linkTest: (l) => l.a === sel.id || l.b === sel.id };
    }
    const thread = base.threads.find((t) => t.id === sel.id);
    const ids = new Set(thread ? thread.moments : []);
    return { ids, linkTest: (l) => ids.has(l.a) && ids.has(l.b) };
  }, [sel, base]);

  const select = (id, moveFocus) => {
    setSel({ type: "node", id });
    if (moveFocus) requestAnimationFrame(() => detailRef.current?.focus());
  };
  const follow = (id) => {
    setSel({ type: "thread", id });
    requestAnimationFrame(() => detailRef.current?.focus());
  };

  /* ---------- List of receipts (keyboard friendly) ---------- */
  const listItems = useMemo(() => {
    const strength = new Map();
    shownLinks.forEach((l) => {
      strength.set(l.a, (strength.get(l.a) ?? 0) + l.w + 0.3);
      strength.set(l.b, (strength.get(l.b) ?? 0) + l.w + 0.3);
    });
    const score = (m) => (strength.get(m.id) ?? 0) * m.weight;
    const pool = base.nodes.filter((m) => visible.has(m.id) && matches(m));
    return pool.sort((a, b) => (q ? a.t.localeCompare(b.t) : score(b) - score(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, visible, shownLinks, q]);

  const selNode = sel?.type === "node" ? base.byId.get(sel.id) : null;
  const selThread = sel?.type === "thread" ? base.threads.find((t) => t.id === sel.id) : null;
  const neighbours = selNode
    ? [...(base.adj.get(selNode.id) ?? [])].sort(
        (a, b) => KIND_ORDER[a.link.kind] - KIND_ORDER[b.link.kind] || b.link.w - a.link.w
      )
    : [];

  // Slide the map sideways so the selected receipt (or story) is in view, which matters most on phones.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !sel) return;
    const ids = sel.type === "node" ? [sel.id] : selThread?.moments ?? [];
    const xs = ids.map((id) => base.pos.get(id)?.x).filter((x) => x != null);
    if (!xs.length) return;
    const mid = xs.reduce((a, b) => a + b, 0) / xs.length;
    const left = (mid / W) * el.scrollWidth - el.clientWidth / 2;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  /* ---------- Drawing ---------- */
  const linkPath = (l) => {
    const a = base.pos.get(l.a);
    const b = base.pos.get(l.b);
    const lift = Math.min(110, Math.abs(b.x - a.x) * 0.22 + 18);
    const cy = Math.max(10, (a.y + b.y) / 2 - lift);
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((a.x + b.x) / 2).toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  };
  const isFocusedLink = (l) => focus?.linkTest(l);
  const dimmedLinks = shownLinks.filter((l) => !isFocusedLink(l));
  const litLinks = shownLinks.filter((l) => isFocusedLink(l));
  const years = [];
  for (let y = 2014; y <= 2024; y++) years.push(y);

  return (
    <section className="board" id="connections" aria-labelledby="board-title">
      <header className="board-head">
        <h2 id="board-title">Connect the dots</h2>
        <p>
          Every receipt from the story, laid out by date. Pick one to see what it connects to: purchases near a
          listening peak, the same artist across years, or payments that belong to one story.
        </p>
      </header>

      <div className="controls">
        <div className="search">
          <label htmlFor="board-search">Search receipts</label>
          <input
            id="board-search"
            type="search"
            value={query}
            placeholder="Try “Beatles”, “trip”, or “bike”"
            onChange={(e) => {
              setQuery(e.target.value);
              setListLimit(12);
            }}
          />
        </div>

        <details className="filters" open={filtersOpen}>
          <summary>Filters</summary>
          <div className="filters-body">
        <fieldset>
          <legend>Show</legend>
          {Object.entries(GROUP_LABEL).map(([key, label]) => (
            <Toggle key={key} checked={groups.has(key)} onChange={() => toggle(groups, setGroups, key)}>
              {label}
            </Toggle>
          ))}
        </fieldset>

        <fieldset>
          <legend>Connections</legend>
          {Object.entries(KIND_LABEL).map(([key, label]) => (
            <Toggle key={key} checked={kinds.has(key)} onChange={() => toggle(kinds, setKinds, key)}>
              {label}
            </Toggle>
          ))}
        </fieldset>
          </div>
        </details>
      </div>

      {base.threads.length > 0 && (
        <div className="threads">
          <p id="threads-label">Follow a story:</p>
          <ul aria-labelledby="threads-label">
            {base.threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="thread-btn"
                  aria-pressed={sel?.type === "thread" && sel.id === t.id}
                  onClick={() => follow(t.id)}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="board-hint">Swipe or scroll sideways to travel through time. Colour shows the kind of receipt.</p>
      <div className="board-scroll" role="region" aria-label="Map of receipts over time" tabIndex={0} ref={scrollRef}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Map of ${visible.size} receipts across ${years.length} years, joined by ${shownLinks.length} connections. Use the list below the map to explore with a keyboard or screen reader.`}
        >
          {/* chapter bands */}
          {chapters.map((c) => {
            const x0 = xOf(c.start);
            const x1 = xOf(c.end);
            return (
              <g key={c.id}>
                <rect x={x0} y={30} width={Math.max(2, x1 - x0)} height={H - 60} fill={moodOf(c).color} opacity="0.12" />
                {x1 - x0 > 46 && (
                  <text x={x0 + 6} y={24} className="svg-label">
                    {yearSpan(c)}
                  </text>
                )}
              </g>
            );
          })}
          {/* lane labels + year ticks */}
          {Object.entries(LANES).map(([g, [y0]]) => (
            <text key={g} x={LEFT + 4} y={y0 - 10} className="svg-lane">
              {GROUP_LABEL[g]}
            </text>
          ))}
          {years.map((y) => (
            <g key={y}>
              <line x1={xOf(`${y}-01-01`)} x2={xOf(`${y}-01-01`)} y1={36} y2={H - 34} className="svg-tick" />
              <text x={xOf(`${y}-01-01`) + 3} y={H - 14} className="svg-year">
                {y}
              </text>
            </g>
          ))}

          {/* strings: quiet ones first, highlighted ones on top */}
          <g fill="none">
            {dimmedLinks.map((l, i) => (
              <path
                key={`d${i}`}
                d={linkPath(l)}
                className={`string string-${l.kind}`}
                opacity={focus ? 0.05 : l.kind === "arc" ? 0.7 : 0.16}
              />
            ))}
            {litLinks.map((l, i) => (
              <path key={`l${i}`} d={linkPath(l)} className={`string string-${l.kind} is-lit`} opacity="0.95" />
            ))}
          </g>

          {/* pins */}
          {base.nodes
            .filter((m) => visible.has(m.id))
            .map((m) => {
              const p = base.pos.get(m.id);
              const inFocus = !focus || focus.ids.has(m.id);
              const hit = matches(m);
              const isSel = sel?.type === "node" && sel.id === m.id;
              const r = 3.5 + Math.min(m.weight, 3) * 1.6;
              return (
                <g
                  key={m.id}
                  transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                  opacity={inFocus && hit ? 1 : 0.16}
                  className="pin"
                  onClick={() => select(m.id, false)}
                >
                  <title>{`${m.title} (${shortDate(m.t)})`}</title>
                  <circle r="14" fill="transparent" />
                  <circle r={r} fill={TYPE_COLOR[m.type]} stroke={isSel ? "#fff" : "#18232b"} strokeWidth={isSel ? 3 : 1.2} />
                </g>
              );
            })}
        </svg>
      </div>

      <ul className="legend" aria-label="Legend">
        {Object.entries(TYPE_COLOR).map(([t, c]) => (
          <li key={t}>
            <span className="swatch" style={{ background: c }} aria-hidden="true" />
            {TYPE_NAME[t]}
          </li>
        ))}
        <li>
          <span className="line-swatch string-arc" aria-hidden="true" />
          Part of a story
        </li>
        <li>
          <span className="line-swatch string-theme" aria-hidden="true" />
          Same theme
        </li>
        <li>
          <span className="line-swatch string-time" aria-hidden="true" />
          Close in time
        </li>
      </ul>

      <div className="board-grid">
        {/* Detail slip */}
        <section className="slip" aria-live="polite" aria-label="Selected receipt">
          {!selNode && !selThread && (
            <>
              <h3 ref={detailRef} tabIndex={-1}>
                Nothing pinned yet
              </h3>
              <p>Pick a receipt from the list, or press a story button above, to see how things connect.</p>
            </>
          )}

          {selThread && (
            <>
              <h3 ref={detailRef} tabIndex={-1}>
                {selThread.title}
              </h3>
              <p>{selThread.text}</p>
              <p className="slip-sub">Receipts in this story:</p>
              <ul className="slip-list">
                {[...selThread.moments]
                  .map((id) => base.byId.get(id))
                  .filter(Boolean)
                  .sort((a, b) => a.t.localeCompare(b.t))
                  .map((m) => (
                    <li key={m.id}>
                      <button type="button" onClick={() => select(m.id, true)}>
                        <span className="slip-title">{m.title}</span>
                        <span className="slip-why">{shortDate(m.t)}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          )}

          {selNode && (
            <>
              <p className="slip-type">
                <span className="swatch" style={{ background: TYPE_COLOR[selNode.type] }} aria-hidden="true" />
                {TYPE_NAME[selNode.type]} on <time dateTime={selNode.t.slice(0, 10)}>{shortDate(selNode.t)}</time>
              </p>
              <h3 ref={detailRef} tabIndex={-1}>
                {selNode.title}
              </h3>
              {selNode.sub && <p>{selNode.sub}</p>}
              {selNode.amount != null && <p className="slip-amount">{inr(selNode.amount)}</p>}
              {base.chapterById.get(selNode.chapter) && (
                <p>
                  <a href={`#chapter-${selNode.chapter}`}>
                    Read its chapter: {base.chapterById.get(selNode.chapter).title}
                  </a>
                </p>
              )}

              <p className="slip-sub">
                {neighbours.length
                  ? `Connected to ${neighbours.length} other receipt${neighbours.length === 1 ? "" : "s"}:`
                  : "No connections found. This receipt stands alone."}
              </p>
              {neighbours.length > 0 && (
                <ul className="slip-list">
                  {neighbours.slice(0, 12).map(({ id, link }) => {
                    const n = base.byId.get(id);
                    return (
                      <li key={`${id}-${link.kind}`}>
                        <button type="button" onClick={() => select(id, true)}>
                          <span className="slip-title">{n.title}</span>
                          <span className="slip-why">
                            {KIND_LABEL[link.kind]}: {link.why.replace(/^Shared theme: /, "").replace(/^Part of: /, "")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {neighbours.length > 12 && <p className="slip-sub">Showing the 12 strongest of {neighbours.length}.</p>}
            </>
          )}
        </section>

        {/* Receipts list */}
        <section className="pick" aria-labelledby="pick-title">
          <h3 id="pick-title">
            {q
              ? `${listItems.length} receipt${listItems.length === 1 ? "" : "s"} matching “${query.trim()}”`
              : "Good places to start"}
          </h3>
          {listItems.length === 0 ? (
            <p className="board-empty">Nothing matches. Clear the search or switch a filter back on.</p>
          ) : (
            <ul>
              {listItems.slice(0, listLimit).map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    aria-pressed={sel?.type === "node" && sel.id === m.id}
                    onClick={() => select(m.id, true)}
                  >
                    <span className="swatch" style={{ background: TYPE_COLOR[m.type] }} aria-hidden="true" />
                    <span className="pick-text">
                      <span className="slip-title">{m.title}</span>
                      <span className="slip-why">{shortDate(m.t)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {listItems.length > listLimit && (
            <button type="button" className="more more-dark" onClick={() => setListLimit(listLimit + 12)}>
              Show 12 more
            </button>
          )}
        </section>
      </div>
    </section>
  );
}
