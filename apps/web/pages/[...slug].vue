<script lang="ts" setup>
const route = useRoute()

const { data: page } = await useAsyncData('page', () =>
  queryCollection('content').path(route.path).first(),
)

if (!page.value) {
  throw createError({
    statusCode: 404,
  })
}

useSeoMeta({
  title: page.value?.title,
})
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>
