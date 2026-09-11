export default function PriorityBadge({ priority }) {
  const className =
    priority === "Critical"
      ? "priority-critical"
      : priority === "High"
        ? "priority-high"
        : priority === "Low"
          ? "priority-low"
          : "priority-medium";

  return <span className={`badge ${className}`}>{priority || "Medium"}</span>;
}
