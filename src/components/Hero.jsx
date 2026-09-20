import LineItems from "./LineItems";
import { num, shortDate } from "../lib/format";

export default function Hero({ chapters, meta }) {
  const plays = chapters.reduce((s, c) => s + c.plays, 0);
  const hours = chapters.reduce((s, c) => s + c.hours, 0);
  const swipes = chapters.reduce((s, c) => s + (c.cards?.n ?? 0), 0);
  const payments = meta.cleaning.household_raw_rows;
  const [from, to] = meta.spotifyRange;
  const years = Math.round((Date.parse(to) - Date.parse(from)) / (365.25 * 24 * 3600 * 1000));
  const peak = chapters.find((c) => c.mood === "peak");

  return (
    <header className="hero">
      <h1>Your life, in receipts</h1>
      <p className="hero-dates">
        {shortDate(from)} to {shortDate(to)}
      </p>
      <p className="hero-lede">
        Songs, payments and card swipes from {years} years, printed as one long receipt. Read it from the top, or jump to
        the stretch that stands out.
      </p>

      <LineItems
        animate
        rows={[
          ["Songs played", num(plays)],
          ["Hours of music", num(hours)],
          ["Payments logged", num(payments)],
          ["Card swipes", num(swipes)],
          ["Chapters found", String(chapters.length)],
        ]}
      />

      <p className="hero-total">
        <span>Total</span>
        <span>{years} years</span>
      </p>

      <p className="tears">
        {peak && (
          <a className="tear" href={`#chapter-${peak.id}`}>
            <span aria-hidden="true">✂ </span>Jump to the loudest stretch
          </a>
        )}
        <a className="tear" href="#connections">
          <span aria-hidden="true">✂ </span>Skip to the connections
        </a>
      </p>
    </header>
  );
}
