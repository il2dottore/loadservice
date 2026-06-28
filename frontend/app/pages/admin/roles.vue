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
const selectedRoleId = ref<number | null>(null)
const selectedRoleKey = ref<number | 'blank' | null>(null)
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
  selectedRoleId.value = roleId
  selectedRoleKey.value = roleId
}

function selectBlankRole() {
  selectedRole.value = null
  selectedRoleId.value = null
  selectedRoleKey.value = 'blank'
}

async function loadData() {
  loading.value = true

  try {
    await Promise.all([
      loadRoles(),
      loadPermissions(),
      loadUsers()
    ])

    const fallbackRoleId = selectedRoleId.value ?? roles.value[0]?.id ?? null
    if (selectedRoleKey.value === 'blank') {
      selectBlankRole()
    } else if (fallbackRoleId) {
      await loadRoleDetail(fallbackRoleId)
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

    if (selectedRoleId.value === roleId) {
      selectedRoleId.value = null
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
  if (!selectedRoleId.value) {
    return
  }

  syncingPermissions.value = true

  try {
    if (checked) {
      await $fetch(`/api/admin/roles/${selectedRoleId.value}/permissions`, {
        method: 'POST',
        body: {
          permissionId
        }
      })
    } else {
      await $fetch(`/api/admin/roles/${selectedRoleId.value}/permissions/${permissionId}`, {
        method: 'DELETE'
      })
    }

    await loadRoleDetail(selectedRoleId.value)
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

    if (selectedRoleId.value) {
      await loadRoleDetail(selectedRoleId.value)
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

  const assignedPermissions = new Set(selectedRole.value.permissions.map(permission => permission.id))

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

const isBlankRoleSelected = computed(() => selectedRoleKey.value === 'blank')

const selectedRoleUserIds = computed(() => {
  if (isBlankRoleSelected.value) {
    return blankRoleUserIds.value
  }

  return new Set(selectedRole.value?.users.map(currentUser => currentUser.id) ?? [])
})

const selectedRoleUsersTitle = computed(() => isBlankRoleSelected.value ? 'BLANK users' : `${selectedRole.value?.name || ''} users`)

const selectedRoleUsersDescription = computed(() => (
  isBlankRoleSelected.value
    ? 'Users currently without any role assignment.'
    : 'Browse every user, search quickly, and manage their roles directly.'
))

const filteredUsers = computed(() => {
  const keyword = userSearch.value.trim().toLowerCase()
  const assignedUsers = selectedRoleUserIds.value

  return users.value
    .filter((managedUser) => {
      if (isBlankRoleSelected.value && managedUser.roles.length) {
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
      const leftAssigned = assignedUsers.has(left.id) ? 1 : 0
      const rightAssigned = assignedUsers.has(right.id) ? 1 : 0

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

watch(userSearch, () => {
  usersPage.value = 1
})

watch(selectedRoleId, () => {
  usersPage.value = 1
})

watch(selectedRoleKey, () => {
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
        description="Select a role to manage its permissions and users."
        variant="subtle"
      >
        <div v-if="roles.length" class="flex flex-col gap-3">
          <button
            v-for="role in roles"
            :key="role.id"
            type="button"
            class="rounded-xl border px-4 py-3 text-left transition"
            :class="selectedRoleKey === role.id ? 'border-primary bg-primary/10' : 'border-default hover:border-primary/40'"
            @click="loadRoleDetail(role.id)"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-highlighted">
                  {{ role.name }}
                </p>
                <p class="text-sm text-muted">
                  Role #{{ role.id }}
                </p>
              </div>
              <div class="flex gap-2">
                <UButton
                  label="Edit"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click.stop="editRole(role)"
                />
                <UButton
                  label="Delete"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click.stop="deleteRoleTargetId = role.id"
                />
              </div>
            </div>
          </button>

          <button
            type="button"
            class="rounded-xl border px-4 py-3 text-left transition"
            :class="isBlankRoleSelected ? 'border-primary bg-primary/10' : 'border-default hover:border-primary/40'"
            @click="selectBlankRole"
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
          v-if="selectedRole || isBlankRoleSelected"
          :title="selectedRoleUsersTitle"
          :description="selectedRoleUsersDescription"
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
                    <UBadge
                      :color="selectedRoleUserIds.has(managedUser.id) ? 'primary' : 'neutral'"
                      variant="subtle"
                    >
                      {{ selectedRoleUserIds.has(managedUser.id) ? 'Has this role' : 'Not assigned' }}
                    </UBadge>
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
                <p class="text-sm text-muted">
                  Manage roles
                </p>
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
