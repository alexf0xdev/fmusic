<template>
  <header class="flex items-center justify-between py-5">
    <NuxtLink class="text-3xl font-semibold" to="/">FMusic</NuxtLink>
    <div class="hidden lg:flex items-center gap-10">
      <nav class="flex gap-5">
        <ul>
          <NuxtLink to="/commands">Commands</NuxtLink>
        </ul>
        <ul>
          <NuxtLink to="https://discord.gg/9YNqXkajgZ" target="_blank" rel="nofollow">
            Support
          </NuxtLink>
        </ul>
      </nav>
      <NuxtLink
        class="flex items-center gap-2 bg-orange-500 px-5 py-2.5 rounded"
        to="https://discord.com/oauth2/authorize?client_id=1373747179319202015"
        target="_blank"
        rel="nofollow"
      >
        <Icon name="fa6-brands:discord" />
        Add to server
      </NuxtLink>
    </div>
  </header>
</template>
