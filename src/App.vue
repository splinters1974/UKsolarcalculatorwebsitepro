<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2">
          <svg class="w-8 h-8 text-solar-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9.5 8.5H3l5.5 4-2 6.5L12 15l5.5 4-2-6.5L21 8.5h-6.5L12 2z"/>
          </svg>
          <span class="font-bold text-lg text-gray-900">UK Solar Calculator <span class="text-solar-500">Pro</span></span>
        </a>
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/" class="hover:text-solar-600 transition-colors">Home</a>
          <a href="/calculator" class="btn-primary text-sm py-1.5 px-4">Start Calculator</a>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <router-view />
    </main>

    <footer class="bg-gray-900 text-gray-400 text-sm py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>© {{ new Date().getFullYear() }} UK Solar Calculator Pro. All rights reserved.</p>
        <p class="mt-1 text-xs text-gray-500">Solar irradiance data provided by PVGIS (European Commission). For guidance only.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>
