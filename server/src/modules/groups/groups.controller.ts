import type { Request, Response } from 'express'
import type { AuthRequest } from '../../types/http.js'
import { requireString } from '../../utils/validation.js'
import {
  createGroupComment,
  createGroupPost,
  getGroup,
  getGroups,
  joinGroup,
  leaveGroup,
  toggleGroupLike,
} from './groups.service.js'

export async function listGroupsController(_request: Request, response: Response) {
  const groups = await getGroups()

  response.json({ groups })
}

export async function getGroupController(request: Request, response: Response) {
  const group = await getGroup(request.params.groupId)

  response.json({ group })
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
