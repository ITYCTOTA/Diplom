import { viewIds } from '../data/gamehub'
import type { RouteState, ViewId } from '../types'

export function readRouteFromLocation(): RouteState {
  if (typeof window === 'undefined') {
    return { view: 'home', gameId: '', groupId: '', backView: 'store' }
  }

  const rawHash = window.location.hash.replace(/^#\/?/, '')
  const [viewPart, entityPart] = rawHash.split('/')
  const view = viewIds.has(viewPart as ViewId) ? (viewPart as ViewId) : 'home'
  const gameId = view === 'game' ? entityPart ?? '' : ''
  const groupId = view === 'group' ? entityPart ?? '' : ''
  const historyBackView = (window.history.state as Partial<RouteState> | null)?.backView
  const backView =
    typeof historyBackView === 'string' && viewIds.has(historyBackView as ViewId)
      ? (historyBackView as ViewId)
      : 'store'

  return { view, gameId, groupId, backView }
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

export function getGameBackLabel(view: ViewId) {
  switch (view) {
    case 'home':
      return 'Назад на главную'
    case 'library':
      return 'Назад в библиотеку'
    case 'recommendations':
      return 'Назад к рекомендациям'
    case 'groups':
      return 'Назад к группам'
    case 'friends':
      return 'Назад к друзьям'
    case 'profile':
      return 'Назад в профиль'
    case 'auth':
      return 'Назад'
    case 'store':
    default:
      return 'Назад в магазин'
  }
}
