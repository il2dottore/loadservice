import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const response = error.response?.data
    const validationErrors = response?.errors
      ? Object.values(response.errors).flat().join(' ')
      : ''
    const message = validationErrors || response?.message
    if (typeof message === 'string' && message.length > 0) {
      errMsg = message
    }
  }

  toast.error(errMsg)
}
