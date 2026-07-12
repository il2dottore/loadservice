<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { normalizeRoleDetail } from '~/utils/admin'
import type { AdminPermission, AdminRole, AdminManagedUser } from '~/types'

definePageMeta({
  path: '/admin/roles'
})

const toast = useToast()
const { user, refreshProfile } = useAuth()

const roles = ref<AdminRole[]>([])
const permissions = ref<AdminPermission[]>([])
const users = ref<AdminManagedUser[]>([])
const activeRoleId = ref<number | null>(null)
const selectedRoleFilterIds = ref<number[]>([])
const blankRoleFilterEnabled = ref(false)
const selectedRole = ref<AdminRole | null>(null)
const loading = ref(false)
const saving = ref(false)
const editingRoleId = ref<number | null>(null)
const deletingRole = ref(false)
const deleteRoleTargetId = ref<number | null>(null)
const syncingPermissions = ref(false)
const userSearch = ref('')
const usersPage = ref(1)
const usersPerPage = 8
const syncingUserRoles = reactive<Record<string, boolean>>({})
const form = reactive({
  name: ''
})

async function loadUsers() {
  users.value = await $fetch<AdminManagedUser[]>('/api/users')
}

async function loadRoles() {
  roles.value = await $fetch<AdminRole[]>('/api/admin/roles')
}

async function loadPermissions() {
  permissions.value = await $fetch<AdminPermission[]>('/api/admin/permissions')
}

async function loadRoleDetail(roleId: number) {
  const rows = await $fetch<any[]>(`/api/admin/roles/${roleId}`)
  selectedRole.value = normalizeRoleDetail(rows)
  activeRoleId.value = roleId
}

function toggleRoleFilter(roleId: number) {
  selectedRoleFilterIds.value = selectedRoleFilterIds.value.includes(roleId)
    ? selectedRoleFilterIds.value.filter(id => id !== roleId)
    : [...selectedRoleFilterIds.value, roleId]
}

function toggleBlankRoleFilter() {
  blankRoleFilterEnabled.value = !blankRoleFilterEnabled.value
}

function isRoleFilterSelected(roleId: number) {
  return selectedRoleFilterIds.value.includes(roleId)
}

async function loadData() {
  loading.value = true

  try {
    await Promise.all([
      loadRoles(),
      loadPermissions(),
      loadUsers()
    ])

    const availableRoleIds = new Set(roles.value.map(role => role.id))
    selectedRoleFilterIds.value = selectedRoleFilterIds.value.filter(roleId => availableRoleIds.has(roleId))

    if (activeRoleId.value && !availableRoleIds.has(activeRoleId.value)) {
      activeRoleId.value = null
      selectedRole.value = null
    }

    const fallbackRoleId = activeRoleId.value ?? roles.value[0]?.id ?? null
    if (fallbackRoleId) {
      await loadRoleDetail(fallbackRoleId)
    } else {
      selectedRole.value = null
    }
  }
  catch (error: any) {
    toast.add({
      title: 'Could not load roles',
      description: error?.data?.message || error?.statusMessage || 'Unable to fetch role management data.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    loading.value = false
  }
}

function resetForm() {
  editingRoleId.value = null
  form.name = ''
}

function editRole(role: AdminRole) {
  editingRoleId.value = role.id
  form.name = role.name
}

async function saveRole() {
  if (!form.name.trim()) {
    return
  }

  saving.value = true

  try {
    if (editingRoleId.value) {
      await $fetch(`/api/admin/roles/${editingRoleId.value}`, {
        method: 'PUT',
        body: {
          name: form.name.trim()
        }
      })
    } else {
      await $fetch('/api/admin/roles/create', {
        method: 'POST',
        body: {
          name: form.name.trim()
        }
      })
    }

    toast.add({
      title: editingRoleId.value ? 'Role updated' : 'Role created',
      color: 'success',
      icon: 'i-lucide-check'
    })

    resetForm()
    await loadData()
  }
  catch (error: any) {
    toast.add({
      title: 'Save failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to save role.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    saving.value = false
  }
}

async function deleteRole(roleId: number) {
  deletingRole.value = true

  try {
    await $fetch(`/api/admin/roles/${roleId}`, {
      method: 'DELETE'
    })

    selectedRoleFilterIds.value = selectedRoleFilterIds.value.filter(id => id !== roleId)

    if (activeRoleId.value === roleId) {
      activeRoleId.value = null
      selectedRole.value = null
    }

    if (editingRoleId.value === roleId) {
      resetForm()
    }

    toast.add({
      title: 'Role deleted',
      color: 'success',
      icon: 'i-lucide-check'
    })

    deleteRoleTargetId.value = null
    await loadData()
  }
  catch (error: any) {
    toast.add({
      title: 'Delete failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to delete role.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    deletingRole.value = false
  }
}

async function togglePermission(permissionId: string, checked: boolean) {
  if (!activeRoleId.value) {
    return
  }

  syncingPermissions.value = true

  try {
    if (checked) {
      await $fetch(`/api/admin/roles/${activeRoleId.value}/permissions`, {
        method: 'POST',
        body: {
          permissionId
        }
      })
    } else {
      await $fetch(`/api/admin/roles/${activeRoleId.value}/permissions/${permissionId}`, {
        method: 'DELETE'
      })
    }

    await loadRoleDetail(activeRoleId.value)
  }
  finally {
    syncingPermissions.value = false
  }
}

async function toggleUserRole(userId: string, roleName: string, checked: boolean) {
  const role = roles.value.find(item => item.name === roleName)

  if (!role) {
    return
  }

  syncingUserRoles[userId] = true

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

    if (activeRoleId.value) {
      await loadRoleDetail(activeRoleId.value)
    }
  }
  finally {
    syncingUserRoles[userId] = false
  }
}

const permissionMenuItems = computed<DropdownMenuItem[][]>(() => {
  if (!selectedRole.value) {
    return [[]]
  }

  const assignedPermissions = new Set((selectedRole.value.permissions ?? []).map(permission => permission.id))

  return [permissions.value.map(permission => ({
    label: permission.id,
    type: 'checkbox' as const,
    checked: assignedPermissions.has(permission.id),
    disabled: syncingPermissions.value,
    onUpdateChecked(checked: boolean) {
      void togglePermission(permission.id, checked)
    },
    onSelect(event: Event) {
      event.preventDefault()
    }
  }))]
})

const blankRoleUserIds = computed(() => new Set(
  users.value
    .filter(managedUser => !managedUser.roles.length)
    .map(managedUser => managedUser.id)
))

const roleFilterNames = computed(() => {
  const selectedRoleIds = new Set(selectedRoleFilterIds.value)
  return roles.value
    .filter(role => selectedRoleIds.has(role.id))
    .map(role => role.name)
})

const hasActiveUserFilters = computed(() => selectedRoleFilterIds.value.length > 0 || blankRoleFilterEnabled.value)

const managedRoleUserIds = computed(() => new Set(selectedRole.value?.users?.map(currentUser => currentUser.id) ?? []))

const filteredRoleUserIds = computed(() => {
  if (!hasActiveUserFilters.value) {
    return new Set(users.value.map(managedUser => managedUser.id))
  }

  const filteredRoleNames = new Set(roleFilterNames.value)

  return new Set(
    users.value
      .filter((managedUser) => {
        const matchesRole = managedUser.roles.some(roleName => filteredRoleNames.has(roleName))
        const matchesBlank = blankRoleFilterEnabled.value && !managedUser.roles.length

        return matchesRole || matchesBlank
      })
      .map(managedUser => managedUser.id)
  )
})

const usersCardTitle = computed(() => hasActiveUserFilters.value ? 'Filtered users' : 'Users')

const usersCardDescription = computed(() => {
  const parts: string[] = []

  if (roleFilterNames.value.length) {
    parts.push(`Showing users with: ${roleFilterNames.value.join(', ')}`)
  }

  if (blankRoleFilterEnabled.value) {
    parts.push('Including users without roles')
  }

  if (selectedRole.value) {
    parts.push(`Managing role: ${selectedRole.value.name}`)
  }

  return parts.length
    ? `${parts.join(' • ')}.`
    : 'Browse every user, search quickly, and manage their roles directly.'
})

const filteredUsers = computed(() => {
  const keyword = userSearch.value.trim().toLowerCase()
  const priorityUserIds = hasActiveUserFilters.value ? filteredRoleUserIds.value : managedRoleUserIds.value

  return users.value
    .filter((managedUser) => {
      if (hasActiveUserFilters.value && !filteredRoleUserIds.value.has(managedUser.id)) {
        return false
      }

      if (!keyword) {
        return true
      }

      const fullName = `${managedUser.firstName} ${managedUser.lastName}`.trim().toLowerCase()
      return fullName.includes(keyword)
        || managedUser.username.toLowerCase().includes(keyword)
        || managedUser.email.toLowerCase().includes(keyword)
        || managedUser.roles.some(roleName => roleName.toLowerCase().includes(keyword))
    })
    .sort((left, right) => {
      const leftAssigned = priorityUserIds.has(left.id) ? 1 : 0
      const rightAssigned = priorityUserIds.has(right.id) ? 1 : 0

      if (leftAssigned !== rightAssigned) {
        return rightAssigned - leftAssigned
      }

      return `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`)
    })
})

const totalUserPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / usersPerPage)))

const paginatedUsers = computed(() => {
  const start = (usersPage.value - 1) * usersPerPage
  return filteredUsers.value.slice(start, start + usersPerPage)
})

function roleMenuItems(managedUser: AdminManagedUser): DropdownMenuItem[][] {
  const assignedRoles = new Set(managedUser.roles)

  return [roles.value.map(role => ({
    label: role.name,
    type: 'checkbox' as const,
    checked: assignedRoles.has(role.name),
    disabled: !!syncingUserRoles[managedUser.id],
    onUpdateChecked(checked: boolean) {
      void toggleUserRole(managedUser.id, role.name, checked)
    },
    onSelect(event: Event) {
      event.preventDefault()
    }
  }))]
}

function roleActionMenuItems(role: AdminRole): DropdownMenuItem[][] {
  return [[
    {
      label: 'Manage',
      icon: 'i-lucide-shield-check',
      onSelect() {
        void loadRoleDetail(role.id)
      }
    },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() {
        editRole(role)
      }
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect() {
        deleteRoleTargetId.value = role.id
      }
    }
  ]]
}

watch(userSearch, () => {
  usersPage.value = 1
})

watch(activeRoleId, () => {
  usersPage.value = 1
})

watch(selectedRoleFilterIds, () => {
  usersPage.value = 1
}, { deep: true })

watch(blankRoleFilterEnabled, () => {
  usersPage.value = 1
})

watch(totalUserPages, (value) => {
  if (usersPage.value > value) {
    usersPage.value = value
  }
})

await loadData()
</script>

<template>
  <div class="flex flex-col gap-6">
    <UPageCard
      :title="editingRoleId ? 'Update role' : 'Create role'"
      description="Roles bundle permissions, then get assigned to users."
      variant="subtle"
    >
      <form class="flex flex-col gap-4 sm:flex-row" @submit.prevent="saveRole">
        <UInput
          v-model="form.name"
          placeholder="ADMINISTRATOR"
          class="flex-1"
        />
        <div class="flex gap-2">
          <UButton
            type="submit"
            :label="saving ? 'Saving...' : editingRoleId ? 'Update' : 'Create'"
            :loading="saving"
          />
          <UButton
            v-if="editingRoleId"
            type="button"
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="resetForm"
          />
        </div>
      </form>
    </UPageCard>

    <div class="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <UPageCard
        title="Roles"
        description="Toggle roles to filter users. Use Manage to edit one role's permissions."
        variant="subtle"
        :ui="{ container: 'content-start', wrapper: 'flex-none items-start' }"
      >
        <div v-if="roles.length" class="flex flex-col gap-3">
          <div
            v-for="role in roles"
            :key="role.id"
            class="cursor-pointer rounded-xl border px-4 py-3 text-left transition"
            :class="isRoleFilterSelected(role.id) ? 'border-primary bg-primary/10' : 'border-default hover:border-primary/40'"
            @click="toggleRoleFilter(role.id)"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-highlighted">
                    {{ role.name }}
                  </p>
                  <UBadge
                    v-if="activeRoleId === role.id"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  >
                    Managing
                  </UBadge>
                </div>
                <p class="text-sm text-muted">
                  Role #{{ role.id }}
                </p>
              </div>
              <div class="flex justify-end" @click.stop>
                <UDropdownMenu
                  :items="roleActionMenuItems(role)"
                  :content="{ align: 'end', side: 'bottom', collisionPadding: 12 }"
                  :ui="{ content: 'w-44' }"
                >
                  <UButton
                    icon="i-lucide-ellipsis"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :aria-label="`Role actions for ${role.name}`"
                  />
                </UDropdownMenu>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="rounded-xl border px-4 py-3 text-left transition"
            :class="blankRoleFilterEnabled ? 'border-primary bg-primary/10' : 'border-default hover:border-primary/40'"
            @click="toggleBlankRoleFilter"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-highlighted">
                  BLANK
                </p>
                <p class="text-sm text-muted">
                  Users without roles
                </p>
              </div>
              <UBadge color="neutral" variant="subtle">
                {{ blankRoleUserIds.size }}
              </UBadge>
            </div>
          </button>

          <UButton
            v-if="hasActiveUserFilters"
            type="button"
            label="Clear filters"
            color="neutral"
            variant="outline"
            @click="selectedRoleFilterIds = []; blankRoleFilterEnabled = false"
          />
        </div>

        <UAlert
          v-else
          title="No roles yet"
          :description="loading ? 'Loading roles...' : 'Create the first role to start authorization management.'"
          color="neutral"
          variant="soft"
          icon="i-lucide-shield"
        />
      </UPageCard>

      <div class="flex flex-col gap-6">
        <UPageCard
          v-if="selectedRole"
          :title="`${selectedRole.name} permissions`"
          description="Add or remove permission rules from this role."
          variant="subtle"
        >
          <div class="flex flex-col gap-4">
            <UDropdownMenu
              :items="permissionMenuItems"
              :content="{ align: 'start', side: 'bottom', collisionPadding: 12 }"
              :ui="{ content: 'w-80 max-w-[calc(100vw-2rem)]' }"
            >
              <UButton
                :label="syncingPermissions ? 'Updating permissions...' : 'Manage permissions'"
                icon="i-lucide-list-checks"
                color="neutral"
                variant="outline"
                :loading="syncingPermissions"
              />
            </UDropdownMenu>

            <div class="flex flex-wrap gap-2">
              <div
                v-for="permission in selectedRole.permissions || []"
                :key="permission.id"
                class="flex items-center gap-2 rounded-full border border-default px-3 py-1.5 text-sm"
              >
                <span>{{ permission.id }}</span>
              </div>
            </div>
          </div>
        </UPageCard>

        <UPageCard
          :title="usersCardTitle"
          :description="usersCardDescription"
          variant="subtle"
        >
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <UInput
                v-model="userSearch"
                icon="i-lucide-search"
                placeholder="Search by name, username, email, role"
                class="w-full sm:max-w-md"
              />
              <p class="text-sm text-muted">
                {{ filteredUsers.length }} users
              </p>
            </div>

            <div
              v-for="managedUser in paginatedUsers"
              :key="managedUser.id"
              class="flex flex-col gap-4 rounded-xl border border-default px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div class="space-y-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-medium text-highlighted">
                      {{ managedUser.firstName }} {{ managedUser.lastName }}
                    </p>
                  </div>
                  <p class="text-sm text-muted">
                    @{{ managedUser.username }} • {{ managedUser.email }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span
                    v-if="!managedUser.roles.length"
                    class="text-sm text-muted"
                  >
                    No roles assigned
                  </span>
                  <div
                    v-for="roleName in managedUser.roles"
                    :key="roleName"
                    class="rounded-full border border-default px-3 py-1 text-sm"
                  >
                    {{ roleName }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <UDropdownMenu
                  :items="roleMenuItems(managedUser)"
                  :content="{ align: 'end', side: 'bottom', collisionPadding: 12 }"
                  :ui="{ content: 'w-72 max-w-[calc(100vw-2rem)]' }"
                >
                  <UButton
                    :label="syncingUserRoles[managedUser.id] ? 'Updating...' : 'Manage roles'"
                    icon="i-lucide-list-checks"
                    color="neutral"
                    variant="outline"
                    :loading="!!syncingUserRoles[managedUser.id]"
                  />
                </UDropdownMenu>
              </div>
            </div>

            <UAlert
              v-if="!paginatedUsers.length"
              title="No users found"
              description="Try a different keyword to find the user you want."
              color="neutral"
              variant="soft"
              icon="i-lucide-search-x"
            />

            <div
              v-if="filteredUsers.length > usersPerPage"
              class="flex justify-end"
            >
              <UPagination
                v-model:page="usersPage"
                :items-per-page="usersPerPage"
                :total="filteredUsers.length"
              />
            </div>
          </div>
        </UPageCard>
      </div>
    </div>

    <ConfirmModal
      :open="!!deleteRoleTargetId"
      title="Delete role"
      description="Delete this role? Users with this role will lose its permissions."
      :loading="deletingRole"
      @confirm="deleteRoleTargetId && deleteRole(deleteRoleTargetId)"
      @cancel="deleteRoleTargetId = null"
    />
  </div>
</template>
