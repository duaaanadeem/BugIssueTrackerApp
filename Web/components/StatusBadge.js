export default function StatusBadge({ status }) {
  const className =
    status === "Resolved"
      ? "status-resolved"
      : status === "Closed"
        ? "status-closed"
        : status === "In Progress"
          ? "status-progress"
          : "status-open";

  return <span className={`badge ${className}`}>{status || "Open"}</span>;
}
