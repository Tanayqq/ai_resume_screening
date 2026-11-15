import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, ArrowRight } from "lucide-react";
import { analyzeFiles } from "../services/api";

const PRESETS = [
  {
    name: "Full-Stack Dev",
    desc: "Seeking Full-Stack Developer proficient in Python, FastAPI, React, JavaScript, REST APIs, SQL, and Git."
  },
  {
    name: "ML / AI Engineer",
    desc: "Looking for Machine Learning Engineer skilled in Python, Scikit-learn, XGBoost, TF-IDF, NLP, Pandas, and Model Deployment."
  },
  {
    name: "Data Analyst",
    desc: "Hiring Data Analyst with strong background in SQL, Python, Excel, PowerBI, Tableau, and Statistical Analysis."
  }
];

export default function UploadForm({ setResults, setLoading, loading }) {
  const [jdText, setJdText] = useState("");
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    setResumes((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const additions = acceptedFiles.filter((f) => !existing.has(f.name));
      return [...prev, ...additions];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"]
    },
    multiple: true
  });

  const removeFile = (idx) => {
    setResumes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePreset = (text) => {
    setJdText(text);
    setError("");
  };

  const handleSubmit = async () => {
    if (!jdText.trim()) {
      return setError("Please provide a Job Description (or click one of the quick presets).");
    }
    if (resumes.length === 0) {
      return setError("Please upload at least one candidate resume (PDF or DOCX).");
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      resumes.forEach((f) => formData.append("resumes", f));
      formData.append("job_description_text", jdText);

      const res = await analyzeFiles(formData);
      if (res && res.results) {
        setResults(res.results);
      } else {
        setError("Invalid response format received from backend.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to analyze resumes. Ensure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-box">
      {error && <div className="alert-error">{error}</div>}

      <div className="input-grid">
        {/* Left Column: Job Description */}
        <div className="field-group">
          <div className="field-header">
            <label className="field-label">1. Job Description</label>
            <div className="field-actions">
              {jdText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setJdText("")}
                  style={{ background: "none", border: "none", color: "#6b7280", fontSize: "11px", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
              <span className="text-count">{jdText.length} chars</span>
            </div>
          </div>

          <div className="role-tags">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                className="tag-btn"
                onClick={() => handlePreset(p.desc)}
              >
                + {p.name}
              </button>
            ))}
          </div>

          <textarea
            className="clean-textarea"
            placeholder="Paste target job requirements, skills, qualifications, or click a quick preset above..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>

        {/* Right Column: Resume Upload */}
        <div className="field-group">
          <div className="field-header">
            <label className="field-label">
              2. Candidate Resumes ({resumes.length})
            </label>
            {resumes.length > 0 && (
              <button
                type="button"
                onClick={() => setResumes([])}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "11px", cursor: "pointer" }}
              >
                Clear all
              </button>
            )}
          </div>

          <div
            {...getRootProps()}
            className={`dropzone-container ${isDragActive ? "is-active" : ""}`}
          >
            <input {...getInputProps()} />
            <UploadCloud size={28} color="#6b7280" />
            <div className="dropzone-title">
              {isDragActive ? "Drop files to attach" : "Choose files or drag & drop"}
            </div>
            <div className="dropzone-hint">
              Supports PDF, DOCX, or TXT
            </div>
          </div>

          {resumes.length > 0 && (
            <div className="file-list">
              {resumes.map((file, idx) => (
                <div key={idx} className="file-row">
                  <span className="file-name" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={() => removeFile(idx)}
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        <span>Analyze & Rank Resumes</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
