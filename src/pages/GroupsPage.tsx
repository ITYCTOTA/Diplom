import { Post, SectionTitle } from '../components/ui'
import { groupVars } from '../services/format'
import type { Group } from '../types'

export function GroupsPage({
  groups,
  joinedGroups,
  onOpenGroup,
  onToggleGroup,
}: {
  groups: Group[]
  joinedGroups: string[]
  onOpenGroup: (group: Group) => void
  onToggleGroup: (groupId: string) => void
}) {
  return (
    <div className="view-stack">
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
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => onOpenGroup(group)}
                >
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

      <section className="panel">
        <SectionTitle title="Лента групп" meta="сегодня" />
        <div className="post-list">
          <Post
            author="Космические RPG"
            text="Собрали карту редких событий нового сезона Starfall Odyssey."
          />
          <Post
            author="Инди на вечер"
            text="Old Forest попала в подборку спокойных игр до десяти часов."
          />
        </div>
      </section>
    </div>
  )
}
