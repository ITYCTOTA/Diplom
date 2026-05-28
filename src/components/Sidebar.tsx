import { moneyLabel } from '../services/format'
import { navItems } from '../data/gamehub'
import type { AuthUser, ViewId } from '../types'

export function Sidebar({
  activeView,
  authUser,
  onNavigate,
  onAuth,
  onLogout,
}: {
  activeView: ViewId
  authUser: AuthUser | null
  onNavigate: (view: ViewId) => void
  onAuth: () => void
  onLogout: () => void
}) {
  return (
    <aside className="sidebar" aria-label="Основная навигация">
      <div className="sidebar-main">
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

      <div className="sidebar-footer">
        {authUser ? (
          <div className="wallet-card">
            <span className="eyebrow">Кошелек</span>
            <strong>{moneyLabel(authUser.walletBalanceCents)}</strong>
            <p>{authUser.nickname}</p>
          </div>
        ) : (
          <div className="wallet-card guest">
            <span className="eyebrow">Аккаунт</span>
            <strong>Гость</strong>
            <p>Войдите, чтобы увидеть баланс и покупки.</p>
          </div>
        )}

        <button
          type="button"
          className={authUser ? 'secondary-button' : 'primary-button'}
          onClick={authUser ? onLogout : onAuth}
        >
          {authUser ? 'Выйти из аккаунта' : 'Войти'}
        </button>
      </div>
    </aside>
  )
}
