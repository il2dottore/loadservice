<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AdminManagedUser, AdminRole } from '~/types'

definePageMeta({
  path: '/admin/users'
})

const toast = useToast()
const { user, refreshProfile } = useAuth()

const users = ref<AdminManagedUser[]>([])
const roles = ref<AdminRole[]>([])
const loading = ref(false)
const saving = ref(false)
const editingUserId = ref<string | null>(null)
const deletingUser = ref(false)
const deleteUserTargetId = ref<string | null>(null)
const syncingRoles = reactive<Record<string, boolean>>({})
const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  emailVerified: false
})

async function loadRoles() {
  roles.value = await $fetch<AdminRole[]>('/api/admin/roles')
}

async function loadUsers() {
  users.value = await $fetch<AdminManagedUser[]>('/api/users')
}

async function loadData() {
  loading.value = true

  try {
    await Promise.all([
      loadRoles(),
      loadUsers()
    ])
  }
  catch (error: any) {
    toast.add({
      title: 'Could not load users',
      description: error?.data?.message || error?.statusMessage || 'Unable to fetch user management data.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    loading.value = false
  }
}

function resetForm() {
  editingUserId.value = null
  form.firstName = ''
  form.lastName = ''
  form.username = ''
  form.email = ''
  form.phoneNumber = ''
  form.password = ''
  form.emailVerified = false
}

function editUser(managedUser: AdminManagedUser) {
  editingUserId.value = managedUser.id
  form.firstName = managedUser.firstName
  form.lastName = managedUser.lastName
  form.username = managedUser.username
  form.email = managedUser.email
  form.phoneNumber = managedUser.phoneNumber ?? ''
  form.password = ''
  form.emailVerified = managedUser.emailVerified
}

async function saveUser() {
  if (!form.firstName || !form.lastName || !form.username || !form.email) {
    return
  }

  if (!editingUserId.value && !form.password) {
    return
  }

  saving.value = true

  try {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim() || undefined,
      emailVerified: form.emailVerified
    }

    if (editingUserId.value) {
      await $fetch(`/api/users/${editingUserId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/users/create', {
        method: 'POST',
        body: {
          ...payload,
          password: form.password
        }
      })
    }

    toast.add({
      title: editingUserId.value ? 'User updated' : 'User created',
      color: 'success',
      icon: 'i-lucide-check'
    })

    resetForm()
    await loadData()
  }
  catch (error: any) {
    toast.add({
      title: 'Save failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to save user.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    saving.value = false
  }
}

async function deleteUser(userId: string) {
  deletingUser.value = true

  try {
    await $fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'User deleted',
      color: 'success',
      icon: 'i-lucide-check'
    })

    if (editingUserId.value === userId) {
      resetForm()
    }

    deleteUserTargetId.value = null
    await loadData()
  }
  catch (error: any) {
    toast.add({
      title: 'Delete failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to delete user.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    deletingUser.value = false
  }
}

async function toggleRole(userId: string, roleName: string, checked: boolean) {
  const role = roles.value.find(item => item.name === roleName)

  if (!role) {
    return
  }

  syncingRoles[userId] = true

  try {
    if (checked) {
      await $fetch(`/api/admin/roles/${role.id}/users`, {
        method: 'POST',
        body: {
          userId
        }
      })
    } else {
      await $fetch(`/api/admin/roles/${role.id}/users/${userId}`, {
        method: 'DELETE'
      })
    }

    if (user.value?.id === userId) {
      await refreshProfile({ force: true })
    }

    await loadUsers()
  }
  finally {
    syncingRoles[userId] = false
  }
}

function roleMenuItems(managedUser: AdminManagedUser): DropdownMenuItem[][] {
  const assignedRoles = new Set(managedUser.roles)

  return [roles.value.map(role => ({
    label: role.name,
    type: 'checkbox' as const,
    checked: assignedRoles.has(role.name),
    disabled: !!syncingRoles[managedUser.id],
    onUpdateChecked(checked: boolean) {
      void toggleRole(managedUser.id, role.name, checked)
    },
    onSelect(event: Event) {
      event.preventDefault()
    }
  }))]
}

await loadData()
</script>

<template>
  <div class="flex flex-col gap-6">
    <UPageCard
      :title="editingUserId ? 'Update user' : 'Create user'"
      description="User management is restricted to administrators."
      variant="subtle"
    >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="saveUser">
        <UInput v-model="form.firstName" placeholder="First name" />
        <UInput v-model="form.lastName" placeholder="Last name" />
        <UInput v-model="form.username" placeholder="Username" />
        <UInput v-model="form.email" placeholder="Email" />
        <UInput v-model="form.phoneNumber" placeholder="Phone number" />
        <UInput v-model="form.password" type="password" :placeholder="editingUserId ? 'Leave blank to keep password' : 'Password'" />

        <label class="flex items-center gap-2 text-sm text-muted md:col-span-2">
          <input v-model="form.emailVerified" type="checkbox">
          Email verified
        </label>

        <div class="flex gap-2 md:col-span-2">
          <UButton
            type="submit"
            :label="saving ? 'Saving...' : editingUserId ? 'Update user' : 'Create user'"
            :loading="saving"
          />
          <UButton
            v-if="editingUserId"
            type="button"
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="resetForm"
          />
        </div>
      </form>
    </UPageCard>

    <UPageCard
      title="Users"
      description="Assign or remove roles from each user."
      variant="subtle"
    >
      <div v-if="users.length" class="flex flex-col gap-4">
        <div
          v-for="managedUser in users"
          :key="managedUser.id"
          class="rounded-2xl border border-default p-4"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2">
              <div>
                <p class="font-medium text-highlighted">
                  {{ managedUser.firstName }} {{ managedUser.lastName }}
                </p>
                <p class="text-sm text-muted">
                  @{{ managedUser.username }} • {{ managedUser.email }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <div
                  v-for="roleName in managedUser.roles"
                  :key="roleName"
                  class="flex items-center gap-2 rounded-full border border-default px-3 py-1 text-sm"
                >
                  <span>{{ roleName }}</span>
                </div>
                <span
                  v-if="!managedUser.roles.length"
                  class="text-sm text-muted"
                >
                  No roles assigned
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-3 lg:w-80">
              <UDropdownMenu
                :items="roleMenuItems(managedUser)"
                :content="{ align: 'end', side: 'bottom', collisionPadding: 12 }"
                :ui="{ content: 'w-72 max-w-[calc(100vw-2rem)]' }"
              >
                <UButton
                  :label="syncingRoles[managedUser.id] ? 'Updating roles...' : 'Manage roles'"
                  icon="i-lucide-list-checks"
                  color="neutral"
                  variant="outline"
                  :loading="!!syncingRoles[managedUser.id]"
                />
              </UDropdownMenu>

              <div class="flex gap-2">
                <UButton
                  label="Edit"
                  color="neutral"
                  variant="outline"
                  @click="editUser(managedUser)"
                />
                <UButton
                  label="Delete"
                  color="error"
                  variant="soft"
                  @click="deleteUserTargetId = managedUser.id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <UAlert
        v-else
        title="No users found"
        :description="loading ? 'Loading users...' : 'Create the first user to begin managing roles.'"
        color="neutral"
        variant="soft"
        icon="i-lucide-users-round"
      />
    </UPageCard>
  </div>

  <ConfirmModal
    :open="!!deleteUserTargetId"
    title="Delete user"
    description="Delete this user account? This action cannot be undone."
    :loading="deletingUser"
    @confirm="deleteUserTargetId && deleteUser(deleteUserTargetId)"
    @cancel="deleteUserTargetId = null"
  />
</template>
