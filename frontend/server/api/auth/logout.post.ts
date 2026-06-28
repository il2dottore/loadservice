import { callCoreApi } from '../../utils/core-api'

export default eventHandler(async (event) => {
  const { userId, sessionId } = await readBody(event)

  if (!userId || !sessionId) {
    throw createError({
      statusCode: 400,
      message: 'userId and sessionId are required.'
    })
  }

  return await callCoreApi('/auth/logout', {
    method: 'POST',
    body: {
      userId,
      sessionId
    }
  })
})
