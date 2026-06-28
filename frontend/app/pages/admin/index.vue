<script setup lang="ts">
definePageMeta({
  path: '/admin'
})
</script>

<template>
  <UPageCard
    title="Plans"
    description="Manage subscription plans and pricing tiers."
    variant="naked"
    orientation="horizontal"
    class="mb-4"
  >
    <UButton
      label="Add plan"
      color="neutral"
      class="w-fit lg:ms-auto"
    />
  </UPageCard>

  <UPageCard variant="subtle">
    <div class="flex flex-col gap-4 p-4 text-center text-dimmed">
      <p>No plans yet. Create your first plan to get started.</p>
    </div>
  </UPageCard>
</template>
