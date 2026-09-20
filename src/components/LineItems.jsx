// A receipt-style list: label ........ value. Uses a description list so screen readers get label/value pairs.
export default function LineItems({ rows, animate = false }) {
  return (
    <dl className="lines">
      {rows.map(([label, value], i) => (
        <div className="line" key={label} style={animate ? { "--i": i } : undefined}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
