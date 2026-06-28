import { callCoreApi } from '../../utils/core-api'
import { requireSelfOrAdminSession } from '../../utils/admin-session'

export default eventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'id is required.'
    })
  }

  requireSelfOrAdminSession(event, id)

  return await callCoreApi(`/users/${id}`)
})
