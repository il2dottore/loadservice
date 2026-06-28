<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
  description?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function onOpenChange(val: boolean) {
  if (!val) {
    emit('cancel')
  }
}
</script>

<template>
  <UModal
    :title="title ?? 'Confirm deletion'"
    :description="description ?? 'Are you sure? This action cannot be undone.'"
    :open="open"
    @update:open="onOpenChange"
  >
    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          :disabled="loading"
          @click="emit('cancel')"
        />
        <UButton
          label="Delete"
          color="error"
          variant="solid"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>