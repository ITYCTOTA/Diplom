import { navItems } from '../data/gamehub'
import type { ViewId } from '../types'

export function Sidebar({
  activeView,
  onNavigate,
}: {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
}) {
  return (
    <aside className="sidebar" aria-label="Основная навигация">
      <div>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>GameHub</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeView ? 'nav-item active' : 'nav-item'}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-dot" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <section className="wallet-panel" aria-label="Кошелек">
        <span>Баланс</span>
        <strong>2 450 ₽</strong>
        <p>7 скидок · 4 друга в сети</p>
      </section>
    </aside>
  )
}
