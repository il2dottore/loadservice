<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [[{
  label: 'Plans',
  icon: 'i-lucide-clipboard-list',
  to: '/admin',
  exact: true
}, {
  label: 'Features',
  icon: 'i-lucide-list-check',
  to: '/admin/features'
}, {
  label: 'Methods',
  icon: 'i-lucide-workflow',
  to: '/admin/methods'
}, {
  label: 'Roles',
  icon: 'i-lucide-badge-check',
  to: '/admin/roles'
}, {
  label: 'Users',
  icon: 'i-lucide-users-round',
  to: '/admin/users'
}, {
  label: 'Permissions',
  icon: 'i-lucide-key-round',
  to: '/admin/permissions'
}]] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardPanel id="admin" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Admin">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-5xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
