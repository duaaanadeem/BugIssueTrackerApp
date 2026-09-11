export default function Card({ children, className = "", dark }) {
  return (
    <div className={`${dark ? "hero" : "card"} ${className}`.trim()}>
      {children}
    </div>
  );
}
