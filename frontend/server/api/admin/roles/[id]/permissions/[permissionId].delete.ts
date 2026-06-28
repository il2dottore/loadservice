import { callCoreApi } from '../../../../../utils/core-api'
import { requireAdminSession } from '../../../../../utils/admin-session'

export default eventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  const permissionId = getRouterParam(event, 'permissionId')

  if (!id || !permissionId) {
    throw createError({
      statusCode: 400,
      message: 'id and permissionId are required.'
    })
  }

  return await callCoreApi(`/admin/roles/${id}/permissions/${permissionId}`, {
    method: 'DELETE'
  })
})
