"use client";

export default function Button({
  children,
  variant = "primary",
  block,
  small,
  className = "",
  ...props
}) {
  const classes = [
    "btn",
    variant === "indigo" ? "btn-indigo" : "",
    variant === "secondary" ? "btn-secondary" : "",
    variant === "danger" ? "btn-danger" : "",
    variant === "primary" ? "btn-primary" : "",
    block ? "btn-block" : "",
    small ? "btn-sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
