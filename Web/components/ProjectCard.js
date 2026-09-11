import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <Link href={`/projects/${project._id}`} className="project-card">
      <div className="row space-between">
        <div className="icon-circle">
          {project.name?.charAt(0).toUpperCase() || "P"}
        </div>
        <span className="muted">→</span>
      </div>
      <h3 style={{ margin: "14px 0 8px" }}>{project.name}</h3>
      <p className="muted" style={{ margin: 0, minHeight: 40 }}>
        {project.description || "No description available"}
      </p>
      <p className="faint" style={{ marginTop: 12 }}>
        Created by {project.createdBy?.name || "Unknown user"}
      </p>
    </Link>
  );
}
