import type { ViewId } from '../types'

export const navItems: Array<{ id: ViewId; label: string }> = [
  { id: 'home', label: 'Главная' },
  { id: 'store', label: 'Магазин' },
  { id: 'library', label: 'Библиотека' },
  { id: 'recommendations', label: 'Рекомендации' },
  { id: 'groups', label: 'Группы' },
  { id: 'friends', label: 'Друзья' },
  { id: 'profile', label: 'Профиль' },
]

export const viewIds = new Set<ViewId>([
  'home',
  'store',
  'game',
  'library',
  'recommendations',
  'groups',
  'group',
  'friends',
  'profile',
  'auth',
])
