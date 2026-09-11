"use client";

export default function Input({
  label,
  error,
  as = "input",
  className = "",
  ...props
}) {
  const Control = as === "textarea" ? "textarea" : as === "select" ? "select" : "input";
  const controlClass =
    as === "textarea" ? "textarea" : as === "select" ? "select" : "input";

  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <Control className={`${controlClass} ${className}`} {...props} />
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  );
}
