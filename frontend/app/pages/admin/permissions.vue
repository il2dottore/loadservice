<script setup lang="ts">
import type { AdminPermission } from '~/types'

definePageMeta({
  path: '/admin/permissions'
})

const toast = useToast()

const permissions = ref<AdminPermission[]>([])
const loading = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const deleting = ref(false)
const deleteTargetId = ref<string | null>(null)
const form = reactive({
  id: ''
})

async function loadPermissions() {
  loading.value = true

  try {
    permissions.value = await $fetch<AdminPermission[]>('/api/admin/permissions')
  }
  catch (error: any) {
    toast.add({
      title: 'Could not load permissions',
      description: error?.data?.message || error?.statusMessage || 'Unable to fetch permissions.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    loading.value = false
  }
}

function resetForm() {
  editingId.value = null
  form.id = ''
}

function editPermission(permission: AdminPermission) {
  editingId.value = permission.id
  form.id = permission.id
}

async function savePermission() {
  if (!form.id.trim()) {
    return
  }

  saving.value = true

  try {
    if (editingId.value) {
      await $fetch(`/api/admin/permissions/${editingId.value}`, {
        method: 'PUT',
        body: {
          id: form.id.trim()
        }
      })
    } else {
      await $fetch('/api/admin/permissions/create', {
        method: 'POST',
        body: {
          id: form.id.trim()
        }
      })
    }

    toast.add({
      title: editingId.value ? 'Permission updated' : 'Permission created',
      color: 'success',
      icon: 'i-lucide-check'
    })

    resetForm()
    await loadPermissions()
  }
  catch (error: any) {
    toast.add({
      title: 'Save failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to save permission.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    saving.value = false
  }
}

async function deletePermission(permissionId: string) {
  deleting.value = true

  try {
    await $fetch(`/api/admin/permissions/${permissionId}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'Permission deleted',
      color: 'success',
      icon: 'i-lucide-check'
    })

    if (editingId.value === permissionId) {
      resetForm()
    }

    deleteTargetId.value = null
    await loadPermissions()
  }
  catch (error: any) {
    toast.add({
      title: 'Delete failed',
      description: error?.data?.message || error?.statusMessage || 'Unable to delete permission.',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    deleting.value = false
  }
}

await loadPermissions()
</script>

<template>
  <div class="flex flex-col gap-6">
    <UPageCard
      :title="editingId ? 'Update permission' : 'Create permission'"
      description="Permissions control what administrators and staff can do in the dashboard."
      variant="subtle"
    >
      <form class="flex flex-col gap-4 sm:flex-row" @submit.prevent="savePermission">
        <UInput
          v-model="form.id"
          placeholder="news:create"
          class="flex-1"
        />
        <div class="flex gap-2">
          <UButton
            type="submit"
            :label="saving ? 'Saving...' : editingId ? 'Update' : 'Create'"
            :loading="saving"
          />
          <UButton
            v-if="editingId"
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
      title="Permissions"
      description="Grant these to roles, then roles to users."
      variant="subtle"
    >
      <div v-if="permissions.length" class="flex flex-col divide-y divide-default">
        <div
          v-for="permission in permissions"
          :key="permission.id"
          class="flex items-center justify-between gap-4 py-4"
        >
          <div>
            <p class="font-medium text-highlighted">
              {{ permission.id }}
            </p>
            <p class="text-sm text-muted">
              Created permission rule
            </p>
          </div>

          <div class="flex gap-2">
            <UButton
              label="Edit"
              color="neutral"
              variant="outline"
              @click="editPermission(permission)"
            />
            <UButton
              label="Delete"
              color="error"
              variant="soft"
              @click="deleteTargetId = permission.id"
            />
          </div>
        </div>
      </div>

      <UAlert
        v-else
        title="No permissions yet"
        :description="loading ? 'Loading permissions...' : 'Create the first permission to start managing access.'"
        color="neutral"
        variant="soft"
        icon="i-lucide-key-round"
      />
    </UPageCard>

    <ConfirmModal
      :open="!!deleteTargetId"
      title="Delete permission"
      :description="`Delete the permission rule &quot;${deleteTargetId}&quot;?`"
      :loading="deleting"
      @confirm="deleteTargetId && deletePermission(deleteTargetId)"
      @cancel="deleteTargetId = null"
    />
  </div>
</template>
