import { SectionTitle } from '../components/ui'
import { groupVars } from '../services/format'
import type { Group } from '../types'

export function GroupsPage({
  groups,
  joinedGroups,
  isAuthenticated,
  onOpenGroup,
  onToggleGroup,
  onOpenCreateGroup,
  searchQuery,
}: {
  groups: Group[]
  joinedGroups: string[]
  isAuthenticated: boolean
  onOpenGroup: (group: Group) => void
  onToggleGroup: (groupId: string) => void
  onOpenCreateGroup: () => void
  searchQuery: string
}) {
  if (groups.length === 0) {
    return (
      <div className="view-stack">
        <section className="panel page-toolbar">
          <SectionTitle title="Группы" meta="0" />
          {isAuthenticated ? (
            <button type="button" className="primary-button" onClick={onOpenCreateGroup}>
              Создать группу
            </button>
          ) : null}
        </section>
        <section className="empty-state">
          <div>
            <h2>{searchQuery.trim().length > 0 ? 'Ничего не найдено' : 'Групп пока нет'}</h2>
            <p>
              {searchQuery.trim().length > 0
                ? 'Попробуйте другой запрос для поиска групп.'
                : 'После появления групп они будут отображаться здесь.'}
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="view-stack">
      <section className="panel page-toolbar">
        <SectionTitle title="Группы" meta={`${groups.length}`} />
        {isAuthenticated ? (
          <button type="button" className="primary-button" onClick={onOpenCreateGroup}>
            Создать группу
          </button>
        ) : null}
      </section>

      <section className="group-grid">
        {groups.map((group) => {
          const joined = joinedGroups.includes(group.id)

          return (
            <article className="group-card panel" key={group.id} style={groupVars(group)}>
              <span className="group-cover" aria-hidden="true" />
              <div>
                <span className="eyebrow">{group.members} участников</span>
                <h2>{group.title}</h2>
                <p>Сейчас обсуждают: {group.topic}</p>
              </div>
              <div className="button-row compact">
                <button type="button" className="primary-button" onClick={() => onOpenGroup(group)}>
                  Открыть
                </button>
                <button
                  type="button"
                  className={joined ? 'secondary-button' : 'ghost-button'}
                  onClick={() => onToggleGroup(group.id)}
                >
                  {joined ? 'Вы подписаны' : 'Вступить'}
                </button>
              </div>
            </article>
          )
        })}
      </section>

      {!isAuthenticated ? (
        <section className="empty-state compact">
          <div>
            <h2>Войдите в аккаунт</h2>
            <p>Социальная лента и личные подписки доступны после авторизации.</p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
