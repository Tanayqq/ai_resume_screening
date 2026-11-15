import { useState } from "react";
import { Download, RotateCcw, Check } from "lucide-react";
import UploadForm from "./components/UploadForm";
import ResultsGrid from "./components/ResultsGrid";
import Dashboard from "./components/Dashboard";
import Loader from "./components/Loader";
import { downloadReport } from "./services/api";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      const blob = await downloadReport(results);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resume_Screening_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export Excel report. Please ensure the backend is running.");
    }
  };

  const handleReset = () => {
    setResults([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">AI</div>
          <div>
            <div className="nav-title">AI Resume Screener</div>
            <div className="nav-subtitle">Siddaganga Institute of Technology • Dept. of CSE</div>
          </div>
        </div>

        <div className="nav-meta">
          <div className="status-badge-live">
            <span className="status-indicator" />
            <span>Ready</span>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="page-header">
        <h1 className="page-title">Candidate Evaluation</h1>
        <p className="page-description">
          Match candidate resumes against technical job requirements using TF-IDF feature extraction, 
          XGBoost machine learning, and ethical bias detection.
        </p>
      </section>

      {/* Input Form */}
      <UploadForm
        setResults={setResults}
        setLoading={setLoading}
        loading={loading}
      />

      {/* Loading state */}
      {loading && <Loader />}

      {/* Evaluation Results */}
      {!loading && results.length > 0 && (
        <section style={{ marginTop: "28px" }}>
          <Dashboard results={results} />
          <ResultsGrid results={results} />

          <div className="bottom-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>Screen Another Batch</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleDownload}
              style={{ background: "#111827", color: "#ffffff", borderColor: "#111827" }}
            >
              <Download size={14} />
              <span>Download Excel Report (.xlsx)</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
