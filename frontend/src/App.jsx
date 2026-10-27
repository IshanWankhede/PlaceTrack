import { useEffect, useState } from "react";
import api from "./services/api";

// Setup-only screen: proves frontend -> backend -> database wiring.
// Replaced by the real app in Phase 6 (ported from /prototype).
export default function App() {
  const [apiStatus, setApiStatus] = useState("checking…");
  const [dbStatus, setDbStatus] = useState("checking…");

  useEffect(() => {
    api.get("/health").then(() => setApiStatus("ok")).catch(() => setApiStatus("unreachable"));
    api
      .get("/health/db")
      .then((r) => setDbStatus(`connected (${r.data.public_tables} tables)`))
      .catch(() => setDbStatus("unreachable"));
  }, []);

  const cls = (v) => (v.startsWith("ok") || v.startsWith("connected") ? "ok" : "bad");

  return (
    <div className="card">
      <h1>PlaceTrack</h1>
      <p>Setup check</p>
      <p>Backend API: <b className={cls(apiStatus)}>{apiStatus}</b></p>
      <p>Database: <b className={cls(dbStatus)}>{dbStatus}</b></p>
    </div>
  );
}
