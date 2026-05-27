import { games, groups, viewIds } from '../data/gamehub'
import type { RouteState, ViewId } from '../types'

export function readRouteFromLocation(): RouteState {
  if (typeof window === 'undefined') {
    return { view: 'home', gameId: games[0].id, groupId: groups[0].id }
  }

  const rawHash = window.location.hash.replace(/^#\/?/, '')
  const [viewPart, entityPart] = rawHash.split('/')
  const view = viewIds.has(viewPart as ViewId) ? (viewPart as ViewId) : 'home'
  const gameId = games.some((game) => game.id === entityPart) ? entityPart : games[0].id
  const groupId = groups.some((group) => group.id === entityPart) ? entityPart : groups[0].id

  return { view, gameId, groupId }
}

export function routeHash(view: ViewId, entityId: string) {
  if (view === 'game') {
    return `#/game/${entityId}`
  }

  if (view === 'group') {
    return `#/group/${entityId}`
  }

  return `#/${view}`
}
