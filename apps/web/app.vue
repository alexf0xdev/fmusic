<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} - FMusic` : 'FMusic'),
  meta: [{ name: 'description', content: 'Fully free music Discord-bot.' }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
