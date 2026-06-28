import { callCoreApi } from '../../../utils/core-api'
import { requireAdminSession } from '../../../utils/admin-session'

export default eventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'id is required.'
    })
  }

  return await callCoreApi(`/admin/roles/${id}`, {
    method: 'PUT',
    body
  })
})
