export async function callCoreApi<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
  const config = useRuntimeConfig()

  try {
    return await $fetch<T>(path, {
      ...options,
      baseURL: config.coreServiceUrl
    }) as T
  }
  catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || error?.response?.status || 500,
      statusMessage: error?.data?.message || error?.message || 'Core service request failed',
      data: error?.data
    })
  }
}
