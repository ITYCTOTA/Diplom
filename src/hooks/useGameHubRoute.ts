import { useEffect, useState } from 'react'
import { readRouteFromLocation, routeHash } from '../services/navigation'
import type { ViewId } from '../types'

export function useGameHubRoute() {
  const [activeView, setActiveView] = useState<ViewId>(() => readRouteFromLocation().view)
  const [selectedGameId, setSelectedGameId] = useState(() => readRouteFromLocation().gameId)
  const [selectedGroupId, setSelectedGroupId] = useState(() => readRouteFromLocation().groupId)
  const [selectedBackView, setSelectedBackView] = useState(() => readRouteFromLocation().backView)

  useEffect(() => {
    const syncRoute = () => {
      const route = readRouteFromLocation()
      setSelectedGameId(route.gameId)
      setSelectedGroupId(route.groupId)
      setSelectedBackView(route.backView)
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
    const nextGameId = view === 'game' ? (entityId ?? selectedGameId) : selectedGameId
    const nextGroupId = view === 'group' ? (entityId ?? selectedGroupId) : selectedGroupId
    const nextBackView =
      view === 'game'
        ? activeView === 'game'
          ? selectedBackView
          : activeView
        : selectedBackView
    const routeEntityId = view === 'group' ? nextGroupId : nextGameId
    const nextHash = routeHash(view, routeEntityId)

    if (window.location.hash !== nextHash) {
      window.history.pushState(
        { view, gameId: nextGameId, groupId: nextGroupId, backView: nextBackView },
        '',
        nextHash,
      )
    }

    setSelectedGameId(nextGameId)
    setSelectedGroupId(nextGroupId)
    setSelectedBackView(nextBackView)
    setActiveView(view)
  }

  return { activeView, selectedGameId, selectedGroupId, selectedBackView, navigate }
}
