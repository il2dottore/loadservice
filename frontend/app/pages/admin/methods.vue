<script setup lang="ts">
definePageMeta({
  path: '/admin/methods'
})
</script>

<template>
  <UPageCard
    title="Methods"
    description="Manage payment and delivery methods."
    variant="naked"
    orientation="horizontal"
    class="mb-4"
  >
    <UButton
      label="Add method"
      color="neutral"
      class="w-fit lg:ms-auto"
    />
  </UPageCard>

  <UPageCard variant="subtle">
    <div class="flex flex-col gap-4 p-4 text-center text-dimmed">
      <p>No methods configured. Add a method to enable processing.</p>
    </div>
  </UPageCard>
</template>
