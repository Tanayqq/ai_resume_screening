import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, ShieldCheck } from "lucide-react";

export default function ResultsGrid({ results }) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  if (!results || results.length === 0) return null;

  const filtered = results.filter((r) => {
    if (activeTab === "selected" && r.status !== "Selected") return false;
    if (activeTab === "consider" && r.status !== "Consider") return false;
    if (activeTab === "rejected" && r.status !== "Rejected") return false;
    if (activeTab === "bias" && !r.bias?.bias_detected) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const role = (r.suggested_role || "").toLowerCase();
      const skills = (r.matching_skills || []).join(" ").toLowerCase();
      return role.includes(q) || skills.includes(q);
    }
    return true;
  });

  const toggleExpand = (idx) => {
    setExpandedId(expandedId === idx ? null : idx);
  };

  const getBadgeClass = (status) => {
    if (status === "Selected") return "badge badge-selected";
    if (status === "Consider") return "badge badge-consider";
    return "badge badge-rejected";
  };

  return (
    <div>
      {/* Filter and Search Bar */}
      <div className="filter-strip">
        <div className="filter-group">
          <button
            type="button"
            className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({results.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === "selected" ? "active" : ""}`}
            onClick={() => setActiveTab("selected")}
          >
            Shortlisted ({results.filter((r) => r.status === "Selected").length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === "consider" ? "active" : ""}`}
            onClick={() => setActiveTab("consider")}
          >
            Review ({results.filter((r) => r.status === "Consider").length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === "rejected" ? "active" : ""}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected ({results.filter((r) => r.status === "Rejected").length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === "bias" ? "active" : ""}`}
            onClick={() => setActiveTab("bias")}
          >
            Bias ({results.filter((r) => r.bias?.bias_detected).length})
          </button>
        </div>

        <input
          type="text"
          className="search-field"
          placeholder="Filter skills or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results Table */}
      <div className="candidate-table-wrap">
        <table className="candidate-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>Rank</th>
              <th>Candidate / Role</th>
              <th style={{ width: "160px" }}>Match Score</th>
              <th style={{ width: "120px" }}>Status</th>
              <th>Matched Skills</th>
              <th style={{ width: "70px", textAlign: "center" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#6b7280", padding: "28px" }}>
                  No candidates match the active filter.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => {
                const score = (r.final_score || 0).toFixed(1);
                const isExpanded = expandedId === i;
                const rankNum = r.rank || i + 1;

                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: "#6b7280" }}>
                      #{rankNum}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>
                        {r.suggested_role || `Candidate #${rankNum}`}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        Confidence: {(r.match_percentage || score)}%
                      </div>
                    </td>
                    <td>
                      <div className="score-cell">
                        <span className="score-text">{score}%</span>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${Math.min(score, 100)}%`,
                              background: score >= 75 ? "#166534" : score >= 50 ? "#d97706" : "#dc2626"
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getBadgeClass(r.status)}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ maxWidth: "340px" }}>
                        {(r.matching_skills || []).slice(0, 4).map((s, idx) => (
                          <span key={idx} className="skill-tag">
                            {s}
                          </span>
                        ))}
                        {(r.matching_skills || []).length > 4 && (
                          <span className="skill-tag">
                            +{(r.matching_skills || []).length - 4} more
                          </span>
                        )}
                        {(r.matching_skills || []).length === 0 && (
                          <span style={{ fontSize: "11.5px", color: "#9ca3af" }}>None detected</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(i)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6b7280",
                          padding: "4px"
                        }}
                        title={isExpanded ? "Collapse" : "Expand details"}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Detail Panel */}
      {expandedId !== null && filtered[expandedId] && (
        <div className="detail-box">
          <div className="detail-row">
            <span className="detail-title">Candidate Profile:</span>
            <span>{filtered[expandedId].suggested_role || `Candidate #${expandedId + 1}`}</span>
          </div>

          <div className="detail-row">
            <span className="detail-title">All Matched Skills:</span>
            <span>
              {(filtered[expandedId].matching_skills || []).map((s, i) => (
                <span key={i} className="skill-tag">{s}</span>
              ))}
            </span>
          </div>

          {(filtered[expandedId].missing_skills || []).length > 0 && (
            <div className="detail-row">
              <span className="detail-title">Missing Requirements:</span>
              <span>
                {filtered[expandedId].missing_skills.map((s, i) => (
                  <span key={i} className="skill-tag skill-tag-missing">{s}</span>
                ))}
              </span>
            </div>
          )}

          <div className="detail-row" style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
            <span className="detail-title">Bias Audit:</span>
            {filtered[expandedId].bias?.bias_detected ? (
              <span style={{ color: "#b91c1c" }}>
                <AlertCircle size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                Flags found: {filtered[expandedId].bias.flags.join(", ")}
              </span>
            ) : (
              <span style={{ color: "#166534" }}>
                <ShieldCheck size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                Fairness Verified: No demographic or non-job-relevant bias indicators detected.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
