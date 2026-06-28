<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthSession } from '~/types'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const toast = useToast()
const { setSession } = useAuth()
const loading = ref(false)

const fields = [{
  name: 'firstName',
  type: 'text' as const,
  label: 'First name',
  placeholder: 'Enter your first name'
}, {
  name: 'lastName',
  type: 'text' as const,
  label: 'Last name',
  placeholder: 'Enter your last name'
}, {
  name: 'username',
  type: 'text' as const,
  label: 'Username',
  placeholder: 'Choose a username'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email'
}, {
  name: 'phoneNumber',
  type: 'text' as const,
  label: 'Phone number',
  placeholder: 'Optional phone number'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
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
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Invalid email'),
  phoneNumber: z.string().optional(),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const response = await $fetch<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: payload.data
    })

    setSession(response)

    toast.add({
      title: 'Account created!',
      description: 'Your account has been created successfully.',
      icon: 'i-lucide-check',
      color: 'success'
    })

    await navigateTo('/home')
  }
  catch (error: any) {
    toast.add({
      title: 'Registration failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to create account.',
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
    title="Create an account"
    :submit="{ label: loading ? 'Creating...' : 'Create account', disabled: loading }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink
        to="/login"
        class="text-primary font-medium"
      >Login</ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
