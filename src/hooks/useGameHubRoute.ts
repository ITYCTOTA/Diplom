import { useEffect, useState } from 'react'
import { games, groups } from '../data/gamehub'
import { readRouteFromLocation, routeHash } from '../services/navigation'
import type { ViewId } from '../types'

export function useGameHubRoute() {
  const [activeView, setActiveView] = useState<ViewId>(() => readRouteFromLocation().view)
  const [selectedGameId, setSelectedGameId] = useState(() => readRouteFromLocation().gameId)
  const [selectedGroupId, setSelectedGroupId] = useState(() => readRouteFromLocation().groupId)

  useEffect(() => {
    const syncRoute = () => {
      const route = readRouteFromLocation()
      setSelectedGameId(route.gameId)
      setSelectedGroupId(route.groupId)
      setActiveView(route.view)
    }

    const currentRoute = readRouteFromLocation()
    window.history.replaceState(
      currentRoute,
      '',
      routeHash(
        currentRoute.view,
        currentRoute.view === 'group' ? currentRoute.groupId : currentRoute.gameId,
      ),
    )

    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)

    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  const navigate = (view: ViewId, entityId?: string) => {
    const nextGameId =
      view === 'game' && entityId && games.some((game) => game.id === entityId)
        ? entityId
        : selectedGameId
    const nextGroupId =
      view === 'group' && entityId && groups.some((group) => group.id === entityId)
        ? entityId
        : selectedGroupId
    const routeEntityId = view === 'group' ? nextGroupId : nextGameId
    const nextHash = routeHash(view, routeEntityId)

    if (window.location.hash !== nextHash) {
      window.history.pushState(
        { view, gameId: nextGameId, groupId: nextGroupId },
        '',
        nextHash,
      )
    }

    setSelectedGameId(nextGameId)
    setSelectedGroupId(nextGroupId)
    setActiveView(view)
  }

  return { activeView, selectedGameId, selectedGroupId, navigate }
}
