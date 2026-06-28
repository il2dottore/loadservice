import { callCoreApi } from '../../utils/core-api'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const { firstName, lastName, username, email, password, phoneNumber } = body

  if (!firstName || !lastName || !username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'First name, last name, username, email, and password are required.'
    })
  }

  return await callCoreApi('/auth/register', {
    method: 'POST',
    body: {
      firstName,
      lastName,
      username,
      email,
      password,
      phoneNumber: phoneNumber || undefined
    }
  })
})
