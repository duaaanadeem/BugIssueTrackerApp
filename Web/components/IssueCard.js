import Link from "next/link";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function IssueCard({ issue }) {
  return (
    <Link href={`/issues/${issue._id}`} className="issue-card">
      <div className="row space-between" style={{ alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{issue.title}</h3>
        <PriorityBadge priority={issue.priority} />
      </div>
      <p className="muted" style={{ minHeight: 40 }}>
        {issue.description}
      </p>
      <div className="row space-between">
        <StatusBadge status={issue.status} />
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
          {issue.assignedTo?.name || "Unassigned"}
        </span>
      </div>
    </Link>
  );
}
