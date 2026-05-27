import type { Friend } from '../types'

export function FriendsPage({ friends }: { friends: Friend[] }) {
  return (
    <section className="friend-grid">
      {friends.map((friend) => (
        <article className="friend-card panel" key={friend.id}>
          <div className="friend-avatar" aria-hidden="true">
            {friend.name.slice(0, 1)}
          </div>
          <div>
            <span className="eyebrow">{friend.status}</span>
            <h2>{friend.name}</h2>
          </div>
        </article>
      ))}
    </section>
  )
}
