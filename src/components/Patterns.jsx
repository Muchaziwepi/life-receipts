export default function Patterns({ insights }) {
  if (!insights.length) return null;
  return (
    <section className="chapter patterns" aria-labelledby="patterns-title">
      <header className="chapter-head">
        <h2 id="patterns-title">Patterns across the years</h2>
        <p className="chapter-dates">Things that show up in every chapter</p>
      </header>
      {insights.map((n) => (
        <aside className="note" key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.text}</p>
        </aside>
      ))}
    </section>
  );
}
