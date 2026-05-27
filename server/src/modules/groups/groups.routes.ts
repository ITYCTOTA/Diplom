import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createGroupCommentController,
  createGroupPostController,
  getGroupController,
  joinGroupController,
  leaveGroupController,
  listGroupsController,
  toggleGroupLikeController,
} from './groups.controller.js'

export const groupsRouter = Router()

groupsRouter.get('/', asyncHandler(listGroupsController))
groupsRouter.get('/:groupId', asyncHandler(getGroupController))
groupsRouter.post('/:groupId/join', authMiddleware, asyncHandler(joinGroupController))
groupsRouter.delete('/:groupId/join', authMiddleware, asyncHandler(leaveGroupController))
groupsRouter.post('/:groupId/posts', authMiddleware, asyncHandler(createGroupPostController))
groupsRouter.post('/posts/:postId/comments', authMiddleware, asyncHandler(createGroupCommentController))
groupsRouter.post('/posts/:postId/like', authMiddleware, asyncHandler(toggleGroupLikeController))
