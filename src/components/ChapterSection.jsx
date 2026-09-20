import { useState } from "react";
import LineItems from "./LineItems";
import { inr, moodOf, num, pct, rangeLabel, shortDate, TYPE_GLYPH, TYPE_LABEL } from "../lib/format";

const PREVIEW = 5;

function Receipts({ moments }) {
  const [open, setOpen] = useState(false);
  const byDate = (a, b) => a.t.localeCompare(b.t);
  const featured = [...moments].sort((a, b) => b.weight - a.weight).slice(0, PREVIEW).sort(byDate);
  const shown = open ? [...moments].sort(byDate) : featured;
  const extra = moments.length - PREVIEW;

  return (
    <section aria-label="Receipts from this chapter">
      <h3>Receipts</h3>
      <ul className="items">
        {shown.map((m) => (
          <li key={m.id} className={`item item-${m.type}`}>
            <span className="glyph" aria-hidden="true">
              {TYPE_GLYPH[m.type]}
            </span>
            <div className="item-body">
              <p className="item-title">
                <span className="sr-only">{TYPE_LABEL[m.type]}: </span>
                {m.title}
              </p>
              <p className="item-sub">
                <time dateTime={m.t.slice(0, 10)}>{shortDate(m.t)}</time>
                {m.sub ? ` · ${m.sub}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button type="button" className="more" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Show fewer receipts" : `Show all ${moments.length} receipts`}
        </button>
      )}
    </section>
  );
}

export default function ChapterSection({ chapter: c, position, total, moments, notes }) {
  const mood = moodOf(c);
  const isPeak = c.mood === "peak";
  const hasMoney = Boolean(c.finance || c.cards);

  return (
    <section
      className="chapter"
      id={`chapter-${c.id}`}
      data-chapter-id={c.id}
      data-mood={c.mood}
      aria-labelledby={`title-${c.id}`}
      style={{ "--mood": mood.color }}
    >
      <header className="chapter-head">
        <p className="chapter-meta">
          <span className="dot" aria-hidden="true" />
          {mood.label}. Chapter {position} of {total}
        </p>
        <h2 id={`title-${c.id}`}>{c.title}</h2>
        <p className="chapter-dates">{rangeLabel(c.start, c.end)}</p>
        {isPeak && (
          <div className="stamp" aria-hidden="true">
            Loudest
            <br />
            stretch
          </div>
        )}
      </header>

      <p className="blurb">{c.blurb}</p>

      {notes.map((n) => (
        <aside className="note" key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.text}</p>
        </aside>
      ))}

      <h3>Listening</h3>
      <LineItems
        rows={[
          ["Songs played", num(c.plays)],
          ["Hours of music", num(c.hours)],
          ["Different artists", num(c.artists)],
          ["Artists heard for the first time", num(c.newArtists)],
          ["Tracks skipped forward", pct(c.fwdRate)],
        ]}
      />

      {c.topArtists.length > 0 && (
        <>
          <h3>Most played</h3>
          <LineItems rows={c.topArtists.map((a) => [a.artist, num(a.plays)])} />
        </>
      )}

      {c.finance && (
        <>
          <h3>Household money</h3>
          <LineItems
            rows={[
              ["Spent", inr(c.finance.spend)],
              ["Saved and invested", inr(c.finance.saved)],
              ["Income", inr(c.finance.income)],
              ["Biggest spending category", c.finance.topCategory ?? "None"],
              ...(c.finance.biggest
                ? [
                    [
                      `Largest payment, ${shortDate(c.finance.biggest.t)}`,
                      inr(c.finance.biggest.amt),
                    ],
                  ]
                : []),
            ]}
          />
        </>
      )}

      {c.cards && (
        <>
          <h3>Card activity</h3>
          <LineItems
            rows={[
              ["Transactions", num(c.cards.n)],
              ["Total charged", inr(c.cards.total)],
              ["Biggest category", c.cards.topCategory.replace(/_/g, " ")],
              ["Flagged in the data", `${Math.round(c.cards.flaggedPct)}%`],
            ]}
          />
        </>
      )}

      {!hasMoney && (
        <p className="muted">No money records overlap this chapter, so it is told through music alone.</p>
      )}

      {moments.length > 0 && <Receipts moments={moments} />}
    </section>
  );
}
