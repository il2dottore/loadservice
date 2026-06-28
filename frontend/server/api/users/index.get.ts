import { callCoreApi } from '../../utils/core-api'
import { requireAdminSession } from '../../utils/admin-session'

export default eventHandler(async (event) => {
  requireAdminSession(event)
  return await callCoreApi('/users')
})
