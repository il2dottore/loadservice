import { callCoreApi } from '../../../utils/core-api'

export default eventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId')

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'userId is required.'
    })
  }

  return await callCoreApi(`/auth/sessions/${userId}`)
})
