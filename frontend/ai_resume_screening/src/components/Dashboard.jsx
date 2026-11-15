export default function Dashboard({ results }) {
  if (!results || results.length === 0) return null;

  const total = results.length;
  const shortlisted = results.filter((r) => r.status === "Selected").length;
  const review = results.filter((r) => r.status === "Consider").length;
  const topScore = Math.max(...results.map((r) => r.final_score || 0)).toFixed(1);

  return (
    <div className="stats-grid">
      <div className="stat-item">
        <div className="stat-label">Total Resumes</div>
        <div className="stat-number">{total}</div>
      </div>

      <div className="stat-item">
        <div className="stat-label">Shortlisted (≥ 75%)</div>
        <div className="stat-number" style={{ color: "#166534" }}>
          {shortlisted}
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">Under Review (50-74%)</div>
        <div className="stat-number" style={{ color: "#92400e" }}>
          {review}
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">Top Match Score</div>
        <div className="stat-number">{topScore}%</div>
      </div>
    </div>
  );
}
