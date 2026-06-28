import { callCoreApi } from '../../utils/core-api'

export default eventHandler(async (event) => {
  const { identifier, password } = await readBody(event)

  if (!identifier || !password) {
    throw createError({
      statusCode: 400,
      message: 'Identifier and password are required.'
    })
  }

  return await callCoreApi('/auth/login', {
    method: 'POST',
    body: {
      username: identifier,
      password
    }
  })
})
