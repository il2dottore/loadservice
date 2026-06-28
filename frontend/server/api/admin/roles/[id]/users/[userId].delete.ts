import { callCoreApi } from '../../../../../utils/core-api'
import { requireAdminSession } from '../../../../../utils/admin-session'

export default eventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

  if (!id || !userId) {
    throw createError({
      statusCode: 400,
      message: 'id and userId are required.'
    })
  }

  return await callCoreApi(`/admin/roles/${id}/users/${userId}`, {
    method: 'DELETE'
  })
})
