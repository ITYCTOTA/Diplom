import type { Request, Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { requireString } from '../../utils/validation.js'
import {
  createGroupComment,
  createGroup,
  createGroupPost,
  getGroup,
  getGroups,
  getUserGroupMemberships,
  joinGroup,
  leaveGroup,
  toggleGroupCommentLike,
  toggleGroupLike,
} from './groups.service.js'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'

export async function listGroupsController(_request: Request, response: Response) {
  const groups = await getGroups()

  response.json({ groups })
}

export async function createGroupController(request: AuthRequest, response: Response) {
  const title = requireString(request.body.title, 'title')
  const description = requireString(request.body.description, 'description')
  const group = await createGroup(request.user!.id, title, description)

  response.status(201).json({ group })
}

export async function getGroupController(request: Request, response: Response) {
  const header = request.headers.authorization
  let viewerId: string | undefined

  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), env.jwtSecret) as { id?: string }
      viewerId = payload.id
    } catch {
      viewerId = undefined
    }
  }

  const group = await getGroup(request.params.groupId, viewerId)

  response.json({ group })
}

export async function getMyGroupMembershipsController(request: AuthRequest, response: Response) {
  const groups = await getUserGroupMemberships(request.user!.id)

  response.json({ groups })
}

export async function joinGroupController(request: AuthRequest, response: Response) {
  const group = await joinGroup(request.user!.id, request.params.groupId)

  response.json({ group })
}

export async function leaveGroupController(request: AuthRequest, response: Response) {
  const group = await leaveGroup(request.user!.id, request.params.groupId)

  response.json({ group })
}

export async function createGroupPostController(request: AuthRequest, response: Response) {
  const title = requireString(request.body.title, 'title')
  const text = requireString(request.body.text, 'text')
  const post = await createGroupPost(request.user!.id, request.params.groupId, title, text)

  response.status(201).json({ post })
}

export async function createGroupCommentController(request: AuthRequest, response: Response) {
  const text = requireString(request.body.text, 'text')
  const comment = await createGroupComment(request.user!.id, request.params.postId, text)

  response.status(201).json({ comment })
}

export async function toggleGroupLikeController(request: AuthRequest, response: Response) {
  const result = await toggleGroupLike(request.user!.id, request.params.postId)

  response.json(result)
}

export async function toggleGroupCommentLikeController(request: AuthRequest, response: Response) {
  const result = await toggleGroupCommentLike(request.user!.id, request.params.commentId)

  response.json(result)
}
