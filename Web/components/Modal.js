"use client";

export default function Modal({
  open,
  title,
  children,
  onClose,
  confirmLabel = "Confirm",
  onConfirm,
  danger,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2 className="page-title" style={{ fontSize: 20 }}>
          {title}
        </h2>
        <p className="muted">{children}</p>
        <div className="row wrap" style={{ marginTop: 18 }}>
          <ButtonLike onClick={onClose} secondary>
            Cancel
          </ButtonLike>
          <ButtonLike onClick={onConfirm} danger={danger}>
            {confirmLabel}
          </ButtonLike>
        </div>
      </div>
    </div>
  );
}

function ButtonLike({ children, onClick, secondary, danger }) {
  const className = danger
    ? "btn btn-danger"
    : secondary
      ? "btn btn-secondary"
      : "btn btn-primary";

  return (
    <button className={className} onClick={onClick} type="button">
      {children}
    </button>
  );
}
