import { useData } from "./lib/useData";
import Story from "./components/Story";

export default function App() {
  const data = useData();

  if (data.status === "loading") {
    return (
      <p className="status" role="status">
        Printing your receipts…
      </p>
    );
  }
  if (data.status === "error") {
    return (
      <div className="status" role="alert">
        <p>The receipts could not be loaded ({data.message}).</p>
        <p>Check that the folder public/data contains chapters.json, moments.json, insights.json and meta.json.</p>
      </div>
    );
  }
  return <Story {...data} />;
}
