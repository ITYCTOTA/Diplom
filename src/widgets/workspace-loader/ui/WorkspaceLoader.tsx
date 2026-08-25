export function WorkspaceLoader() {
  return (
    <section className="workspace-loader panel" aria-busy="true" aria-live="polite">
      <div className="workspace-loader-header">
        <span className="eyebrow">Синхронизация</span>
        <h2>Загружаем рабочую область</h2>
        <p>Подтягиваем данные с сервера и обновляем интерфейс.</p>
      </div>

      <div className="workspace-loader-grid">
        <div className="workspace-loader-card">
          <span className="workspace-loader-line workspace-loader-line-lg" />
          <span className="workspace-loader-line" />
          <span className="workspace-loader-line workspace-loader-line-sm" />
          <span className="workspace-loader-chip" />
        </div>

        <div className="workspace-loader-card workspace-loader-card-wide">
          <span className="workspace-loader-line workspace-loader-line-lg" />
          <span className="workspace-loader-line" />
          <span className="workspace-loader-line" />
          <span className="workspace-loader-line workspace-loader-line-sm" />
        </div>

        <div className="workspace-loader-card">
          <span className="workspace-loader-line workspace-loader-line-lg" />
          <span className="workspace-loader-line" />
          <span className="workspace-loader-chip" />
          <span className="workspace-loader-line workspace-loader-line-sm" />
        </div>
      </div>
    </section>
  )
}
