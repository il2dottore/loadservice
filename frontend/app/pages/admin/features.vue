<script setup lang="ts">
definePageMeta({
  path: '/admin/features'
})
</script>

<template>
  <UPageCard
    title="Features"
    description="Configure feature flags and capabilities."
    variant="naked"
    orientation="horizontal"
    class="mb-4"
  >
    <UButton
      label="Add feature"
      color="neutral"
      class="w-fit lg:ms-auto"
    />
  </UPageCard>

  <UPageCard variant="subtle">
    <div class="flex flex-col gap-4 p-4 text-center text-dimmed">
      <p>No features defined. Add features to manage plan capabilities.</p>
    </div>
  </UPageCard>
</template>
