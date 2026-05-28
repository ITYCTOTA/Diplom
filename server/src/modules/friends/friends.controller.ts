import type { Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { optionalString } from '../../utils/validation.js'
import { acceptFriendRequest, createFriendRequest, getFriends, searchUsers } from './friends.service.js'

export async function listFriendsController(request: AuthRequest, response: Response) {
  const friends = await getFriends(request.user!.id)

  response.json({ friends })
}

export async function createFriendRequestController(request: AuthRequest, response: Response) {
  const friendRequest = await createFriendRequest(request.user!.id, request.params.userId)

  response.status(201).json({ friendRequest })
}

export async function acceptFriendRequestController(request: AuthRequest, response: Response) {
  const result = await acceptFriendRequest(request.user!.id, request.params.requestId)

  response.json(result)
}

export async function searchUsersController(request: AuthRequest, response: Response) {
  const query = optionalString(request.query.query)
  const users = await searchUsers(request.user!.id, query ?? '')

  response.json({ users })
}
