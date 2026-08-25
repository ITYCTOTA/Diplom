export type ViewId =
  | 'home'
  | 'store'
  | 'game'
  | 'library'
  | 'recommendations'
  | 'groups'
  | 'group'
  | 'friends'
  | 'profile'
  | 'auth'

export type RouteState = {
  view: ViewId
  gameId: string
  groupId: string
  backView: ViewId
}
