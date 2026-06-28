<script setup lang="ts">
const tokens = ref<{ name: string; token: string; created: string; lastUsed: string | null }[]>([{
  name: 'Development',
  token: 'ds_••••••••••••a1b2',
  created: '2026-06-01',
  lastUsed: '2026-06-25'
}, {
  name: 'Staging',
  token: 'ds_••••••••••••c3d4',
  created: '2026-05-15',
  lastUsed: null
}])

const newTokenName = ref('')
const showCreated = ref(false)
const createdToken = ref('')
const showToken = ref(false)
const copied = ref(false)

function createToken() {
  if (!newTokenName.value) return

  createdToken.value = `ds_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')}`
  showCreated.value = true
  showToken.value = true
}

async function copyToken(token: string) {
  await navigator.clipboard.writeText(token)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

function revokeToken(name: string) {
  tokens.value = tokens.value.filter(t => t.name !== name)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <UPageCard
      title="Create API token"
      description="Generate a new API token to authenticate requests."
      variant="naked"
      orientation="horizontal"
    />

    <UPageCard variant="subtle">
      <UForm
      class="flex flex-col gap-4 max-w-xs"
      @submit="createToken"
    >
      <UFormField label="Token name" name="name">
        <UInput
          v-model="newTokenName"
          placeholder="e.g. Production, CI/CD"
          class="w-full"
        />
      </UFormField>

      <UButton label="Generate token" type="submit" class="w-fit" />
    </UForm>

    <UPageCard
      v-if="showCreated"
      title="Token created"
      description="Copy this token now. You won't be able to see it again."
      variant="subtle"
      class="mt-2"
    >
      <div class="flex items-center gap-2">
        <code class="text-xs bg-muted px-3 py-2 rounded-md flex-1 truncate font-mono">
          {{ showToken ? createdToken : createdToken.replace(/.(?=.{4})/g, '•') }}
        </code>
        <UButton
          :icon="showToken ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="showToken = !showToken"
        />
        <UButton
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          :color="copied ? 'success' : 'neutral'"
          variant="ghost"
          size="xs"
          @click="copyToken(createdToken)"
        />
      </div>
    </UPageCard>
  </UPageCard>

  <UPageCard
    title="API tokens"
    description="Active tokens for your account."
    variant="naked"
    orientation="horizontal"
    class="mt-8"
  />

  <UPageCard variant="subtle" :ui="{ container: 'p-0 sm:p-0' }">
    <div
      v-for="(token, index) in tokens"
      :key="token.name"
      class="flex items-center justify-between px-4 py-3"
      :class="index !== tokens.length - 1 && 'border-b border-default'"
    >
      <div class="flex flex-col gap-0.5 min-w-0">
        <span class="text-sm font-medium">{{ token.name }}</span>
        <code class="text-xs text-dimmed font-mono truncate">{{ token.token }}</code>
        <span class="text-xs text-dimmed mt-0.5">
          Created {{ token.created }}
          <template v-if="token.lastUsed"> · Last used {{ token.lastUsed }}</template>
          <template v-else> · Never used</template>
        </span>
      </div>

      <UButton
        icon="i-lucide-trash"
        color="error"
        variant="ghost"
        size="xs"
        @click="revokeToken(token.name)"
      />
    </div>

    <div
      v-if="!tokens.length"
      class="p-4 text-center text-sm text-dimmed"
    >
      No tokens created yet.
    </div>
  </UPageCard>
</div>
</template>
