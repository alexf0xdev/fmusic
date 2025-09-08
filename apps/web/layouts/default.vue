<template>
  <div class="flex flex-col min-h-screen max-w-6xl mx-auto px-5">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>
