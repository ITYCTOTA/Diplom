import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { activityRouter } from './modules/activity/activity.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { friendsRouter } from './modules/friends/friends.routes.js'
import { gamesRouter } from './modules/games/games.routes.js'
import { groupsRouter } from './modules/groups/groups.routes.js'
import { libraryRouter } from './modules/library/library.routes.js'
import { profileRouter } from './modules/profile/profile.routes.js'
import { purchasesRouter } from './modules/purchases/purchases.routes.js'
import { recommendationsRouter } from './modules/recommendations/recommendations.routes.js'
import { reviewsRouter } from './modules/reviews/reviews.routes.js'

export const app = express()

app.use(cors({ origin: env.clientOrigins }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/games', gamesRouter)
app.use('/api/games', reviewsRouter)
app.use('/api/library', libraryRouter)
app.use('/api/purchases', purchasesRouter)
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/activity', activityRouter)
app.use('/api/groups', groupsRouter)
app.use('/api/friends', friendsRouter)

app.use(errorMiddleware)
