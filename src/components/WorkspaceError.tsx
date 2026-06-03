type WorkspaceErrorProps = {
  code: string
  title: string
  message: string
  actionLabel: string
  onAction: () => void
}

export function WorkspaceError({
  code,
  title,
  message,
  actionLabel,
  onAction,
}: WorkspaceErrorProps) {
  return (
    <section className="workspace-error panel">
      <div className="workspace-error-card">
        <span className="eyebrow">{code}</span>
        <h2>{title}</h2>
        <p className="workspace-error-code">Код ошибки: {code}</p>
        <p>{message}</p>
        <div className="button-row">
          <button type="button" className="primary-button" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
