import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  acceptFriendRequestController,
  createFriendRequestController,
  listFriendsController,
  searchUsersController,
} from './friends.controller.js'

export const friendsRouter = Router()

friendsRouter.get('/', authMiddleware, asyncHandler(listFriendsController))
friendsRouter.get('/search', authMiddleware, asyncHandler(searchUsersController))
friendsRouter.post('/request/:userId', authMiddleware, asyncHandler(createFriendRequestController))
friendsRouter.post('/accept/:requestId', authMiddleware, asyncHandler(acceptFriendRequestController))
