export default function Loader() {
  return (
    <div className="clean-loader">
      <div className="simple-spinner" />
      <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px", marginBottom: "4px" }}>
        Screening Resumes...
      </div>
      <div style={{ fontSize: "12.5px", color: "#6b7280" }}>
        Extracting text, computing TF-IDF vectors, evaluating XGBoost model, and checking bias.
      </div>
    </div>
  );
}
