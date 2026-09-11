export default function Loading({ message = "Loading..." }) {
  return (
    <div className="loading">
      <div>
        <div className="spinner" />
        <div>{message}</div>
      </div>
    </div>
  );
}
