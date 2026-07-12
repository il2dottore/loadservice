<script setup lang="ts">
import * as z from 'zod'
import type { FormError } from '@nuxt/ui'
import type { ActiveSession } from '~/types'

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: '',
  new: ''
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}

const toast = useToast()
const { auth, user, logout, logoutAll } = useAuth()

const sessions = ref<ActiveSession[]>([])
const loadingSessions = ref(false)
const loggingOutAll = ref(false)
const sessionLoadingMap = reactive<Record<string, boolean>>({})

async function loadSessions() {
  if (!user.value?.id) {
    sessions.value = []
    return
  }

  loadingSessions.value = true

  try {
    sessions.value = await $fetch<ActiveSession[]>(`/api/auth/sessions/${user.value.id}`)
  }
  catch (error: any) {
    toast.add({
      title: 'Could not load sessions',
      description: error?.data?.message || error?.statusMessage || 'Unable to fetch active sessions.',
      icon: 'i-lucide-circle-alert',
      color: 'error'
    })
  }
  finally {
    loadingSessions.value = false
  }
}

const activeSessionId = computed(() => auth.value.sessionId)
const activeSessions = computed(() => sessions.value.map(session => ({
  ...session,
  isCurrent: session.sessionId === activeSessionId.value
})))

async function logoutSession(sessionId: string) {
  if (!user.value?.id) {
    return
  }

  sessionLoadingMap[sessionId] = true

  try {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      body: {
        userId: user.value.id,
        sessionId
      }
    })

    if (sessionId === activeSessionId.value) {
      toast.add({
        title: 'Session ended',
        description: 'Current session has been logged out.',
        icon: 'i-lucide-check',
        color: 'success'
      })
      await logout({ skipRequest: true })
      return
    }

    sessions.value = sessions.value.filter(session => session.sessionId !== sessionId)
    toast.add({
      title: 'Session ended',
      description: 'Selected session has been logged out.',
      icon: 'i-lucide-check',
      color: 'success'
    })
  }
  catch (error: any) {
    toast.add({
      title: 'Logout failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to log out this session.',
      icon: 'i-lucide-circle-alert',
      color: 'error'
    })
  }
  finally {
    sessionLoadingMap[sessionId] = false
  }
}

async function logoutEverywhere() {
  loggingOutAll.value = true

  try {
    toast.add({
      title: 'All sessions ended',
      description: 'You have been logged out from all devices.',
      icon: 'i-lucide-check',
      color: 'success'
    })
    await logoutAll()
  }
  catch (error: any) {
    toast.add({
      title: 'Logout all failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to log out all sessions.',
      icon: 'i-lucide-circle-alert',
      color: 'error'
    })
  }
  finally {
    loggingOutAll.value = false
  }
}

onMounted(loadSessions)
</script>

<template>
  <UPageCard title="Password" description="Confirm your current password before setting a new one." variant="subtle">
    <UForm :schema="passwordSchema" :state="password" :validate="validate" class="flex flex-col gap-4 max-w-xs">
      <UFormField name="current">
        <UInput v-model="password.current" type="password" placeholder="Current password" class="w-full" />
      </UFormField>

      <UFormField name="new">
        <UInput v-model="password.new" type="password" placeholder="New password" class="w-full" />
      </UFormField>

      <UButton label="Update" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard title="Active sessions" description="Review all devices currently signed in to your account."
    variant="subtle">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm text-muted">
            {{ loadingSessions ? 'Loading active sessions...' : `${activeSessions.length} active
            session${activeSessions.length === 1 ? '' : 's'}` }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton label="Refresh" color="neutral" variant="outline" :loading="loadingSessions" @click="loadSessions" />
          <UButton label="Log out all" color="error" variant="soft" :loading="loggingOutAll"
            :disabled="!activeSessions.length" @click="logoutEverywhere" />
        </div>
      </div>
    </template>

    <div v-if="activeSessions.length" class="flex flex-col gap-3">
      <div v-for="session in activeSessions" :key="session.sessionId"
        class="flex items-center justify-between gap-4 rounded-xl border border-default p-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-medium text-highlighted">
              Session {{ session.sessionId.slice(0, 8) }}
            </p>
            <UBadge v-if="session.isCurrent" label="Current" color="success" variant="soft" />
          </div>
          <p class="mt-1 text-sm text-muted break-all">
            {{ session.sessionId }}
          </p>
        </div>

        <UButton :label="session.isCurrent ? 'Log out current' : 'Log out'" color="error" variant="outline"
          :loading="!!sessionLoadingMap[session.sessionId]" @click="logoutSession(session.sessionId)" />
      </div>
    </div>

    <UAlert v-else title="No active sessions" description="There are no active sessions to display right now."
      color="neutral" variant="soft" icon="i-lucide-monitor-off" />
  </UPageCard>

  <UPageCard title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-linear-to-tl from-error/10 from-5% to-default">
    <template #footer>
      <UButton label="Delete account" color="error" />
    </template>
  </UPageCard>
</template>
