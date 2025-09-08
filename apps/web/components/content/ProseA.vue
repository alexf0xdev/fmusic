<script setup lang="ts">
const { href } = defineProps<{ href: string }>()

const isExternal = href.startsWith('https://')
</script>

<template>
  <NuxtLink
    class="text-orange-500"
    :to="href"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'nofollow' : undefined"
  >
    <slot />
  </NuxtLink>
</template>
