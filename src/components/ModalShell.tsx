import type { ReactNode } from 'react'

type ModalShellProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  widthClass?: string
}

export function ModalShell({ title, description, onClose, children, widthClass }: ModalShellProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className={widthClass ? `app-modal ${widthClass}` : 'app-modal'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title.replace(/\s+/g, '-').toLowerCase()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Окно</span>
            <h2 id={title.replace(/\s+/g, '-').toLowerCase()}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="secondary-button modal-close" onClick={onClose}>
            Закрыть
          </button>
        </div>

        {children}
      </section>
    </div>
  )
}
