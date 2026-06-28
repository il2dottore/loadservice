import { callCoreApi } from '../../utils/core-api'
import { requireAdminSession } from '../../utils/admin-session'

export default eventHandler(async (event) => {
  requireAdminSession(event)
  const body = await readBody(event)
  return await callCoreApi('/users/create', {
    method: 'POST',
    body
  })
})
