import "./loading.scss";

export default function Loading() {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );
}
