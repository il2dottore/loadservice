<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthSession } from '~/types'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})

const toast = useToast()
const { setSession } = useAuth()
const loading = ref(false)

const fields = [{
  name: 'identifier',
  type: 'text' as const,
  label: 'Email or username',
  placeholder: 'Enter your email or username',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

const schema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const response = await $fetch<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: payload.data
    })

    setSession(response)

    toast.add({
      title: 'Welcome back!',
      description: 'You have been signed in successfully.',
      icon: 'i-lucide-check',
      color: 'success'
    })

    await navigateTo('/home')
  }
  catch (error: any) {
    toast.add({
      title: 'Login failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to sign in.',
      icon: 'i-lucide-circle-alert',
      color: 'error'
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Welcome back"
    icon="i-lucide-lock"
    :submit="{ label: loading ? 'Signing in...' : 'Sign in', disabled: loading }"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink
        to="/register"
        class="text-primary font-medium"
      >Sign up</ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/"
        class="text-primary font-medium"
        tabindex="-1"
      >Forgot password?</ULink>
    </template>

    <template #footer>
      By signing in, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
