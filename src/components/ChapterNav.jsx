import { moodOf, yearSpan } from "../lib/format";

export default function ChapterNav({ chapters, activeId }) {
  return (
    <nav className="rail" aria-label="Chapters">
      <ol>
        {chapters.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <a
                href={`#chapter-${c.id}`}
                aria-current={active ? "location" : undefined}
                aria-label={`${c.title}`}
                title={c.title}
                className={active ? "is-active" : undefined}
              >
                <span className="dot" style={{ "--mood": moodOf(c).color }} aria-hidden="true" />
                <span className="rail-year">{yearSpan(c)}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
