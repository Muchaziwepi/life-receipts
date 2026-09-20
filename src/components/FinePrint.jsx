import LineItems from "./LineItems";
import { num } from "../lib/format";

export default function FinePrint({ meta }) {
  const c = meta.cleaning;
  const usableCards = c.cards_unique_transactions - c.cards_unusable_missing_time_or_amount;

  return (
    <footer className="chapter fine-print">
      <details>
        <summary>The fine print: how the data was cleaned</summary>
        <LineItems
          rows={[
            ["Music rows read", num(c.spotify_raw_rows)],
            ["Household rows read", num(c.household_raw_rows)],
            ["Card rows read", num(c.cards_raw_rows)],
            ["Duplicate card rows merged", num(c.cards_duplicates_removed)],
            ["Card transactions kept", num(usableCards)],
          ]}
        />
        <ul className="notes-list">
          {meta.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </details>

      <p className="thanks">Thank you. Keep this receipt.</p>
      <div className="barcode" aria-hidden="true" />
    </footer>
  );
}
