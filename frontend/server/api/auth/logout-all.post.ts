import { callCoreApi } from '../../utils/core-api'

export default eventHandler(async (event) => {
  const { userId } = await readBody(event)

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'userId is required.'
    })
  }

  return await callCoreApi('/auth/logout-all', {
    method: 'POST',
    body: {
      userId
    }
  })
})
