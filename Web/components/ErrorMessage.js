export default function ErrorMessage({ message, onRetry }) {
  if (!message) {
    return null;
  }

  return (
    <div className="center-state">
      <div>
        <div className="empty-icon">!</div>
        <h2 className="page-title" style={{ fontSize: 20 }}>
          Something went wrong
        </h2>
        <p className="error-text">{message}</p>
        {onRetry ? (
          <button className="btn btn-primary" type="button" onClick={onRetry}>
            Try Again
          </button>
        ) : null}
      </div>
    </div>
  );
}
