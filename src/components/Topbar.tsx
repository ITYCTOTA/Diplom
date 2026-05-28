import type { ViewId } from '../types'

const titles: Record<ViewId, { eyebrow: string; title: string }> = {
  home: { eyebrow: 'Добро пожаловать', title: 'Привет, ITYCTOTA' },
  store: { eyebrow: 'Каталог', title: 'Магазин игр' },
  game: { eyebrow: 'Карточка игры', title: 'Подробности' },
  library: { eyebrow: 'Моя коллекция', title: 'Библиотека' },
  recommendations: { eyebrow: 'Подборка', title: 'Рекомендации' },
  groups: { eyebrow: 'Сообщество', title: 'Группы' },
  group: { eyebrow: 'Страница группы', title: 'Сообщество' },
  friends: { eyebrow: 'Социальный центр', title: 'Друзья' },
  profile: { eyebrow: 'Аккаунт', title: 'Профиль' },
  auth: { eyebrow: 'Аккаунт', title: 'Авторизация' },
}

type SearchConfig = {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function Topbar({
  activeView,
  notice,
  search,
}: {
  activeView: ViewId
  notice: string
  search?: SearchConfig
}) {
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">{titles[activeView].eyebrow}</span>
        <h1>{titles[activeView].title}</h1>
        <p>{notice}</p>
      </div>
      {search ? (
        <form
          className="topbar-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            search.onSubmit()
          }}
        >
          <input
            type="search"
            value={search.value}
            placeholder={search.placeholder}
            aria-label={search.placeholder}
            onChange={(event) => search.onChange(event.target.value)}
          />
          <button type="submit" className="secondary-button">
            Искать
          </button>
        </form>
      ) : null}
    </header>
  )
}
