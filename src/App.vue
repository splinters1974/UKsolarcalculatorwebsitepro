<template>
  <div class="min-h-screen flex flex-col">

    <!-- Nav -->
    <header class="bg-navy-900 border-b border-white/10 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 flex-shrink-0">
          <svg class="w-8 h-8 text-solar-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9.5 8.5H3l5.5 4-2 6.5L12 15l5.5 4-2-6.5L21 8.5h-6.5L12 2z"/>
          </svg>
          <span class="font-bold text-white text-base leading-tight">
            UK Solar Calculator <span class="text-solar-400">Pro</span>
          </span>
        </router-link>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in navLinks" :key="link.to"
            :to="link.to"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === link.to
              ? 'text-solar-400 bg-white/10'
              : 'text-white/70 hover:text-white hover:bg-white/10'"
          >{{ link.label }}</router-link>
          <router-link
            to="/calculator"
            class="ml-2 btn-primary text-sm py-1.5 px-4"
          >Calculator</router-link>
        </nav>

        <!-- Mobile toggle -->
        <button
          class="md:hidden text-white/70 hover:text-white p-2 rounded-lg"
          @click="mobileOpen = !mobileOpen"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="md:hidden bg-navy-950 border-t border-white/10 px-4 py-3 space-y-1">
        <router-link
          v-for="link in navLinks" :key="link.to"
          :to="link.to"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          @click="mobileOpen = false"
        >{{ link.label }}</router-link>
        <router-link
          to="/calculator"
          class="block mt-2 btn-primary text-sm py-2 text-center"
          @click="mobileOpen = false"
        >Run Calculator</router-link>
      </div>
    </header>

    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-navy-950 text-gray-400 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          <!-- Brand -->
          <div class="lg:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-7 h-7 text-solar-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.5 8.5H3l5.5 4-2 6.5L12 15l5.5 4-2-6.5L21 8.5h-6.5L12 2z"/>
              </svg>
              <span class="font-bold text-white">UK Solar Calculator <span class="text-solar-400">Pro</span></span>
            </div>
            <p class="text-sm leading-relaxed mb-5 max-w-sm">
              Industrial &amp; commercial solar energy solutions for UK businesses. Detailed financial modelling,
              project timeline planning, and expert consultation from enquiry to commissioning.
            </p>
            <div class="space-y-2 text-sm">
              <a href="mailto:martynsheridan621@gmail.com" class="flex items-center gap-2 hover:text-solar-400 transition-colors">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                martynsheridan621@gmail.com
              </a>
              <a href="tel:+447872015769" class="flex items-center gap-2 hover:text-solar-400 transition-colors">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                +44 (0) 7872 015769
              </a>
            </div>
          </div>

          <!-- Pages -->
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-white mb-4">Pages</p>
            <ul class="space-y-2 text-sm">
              <li v-for="link in footerPages" :key="link.to">
                <router-link :to="link.to" class="hover:text-solar-400 transition-colors">{{ link.label }}</router-link>
              </li>
            </ul>
          </div>

          <!-- Solar Topics -->
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-white mb-4">Solar Topics</p>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/about#how-it-works"     class="hover:text-solar-400 transition-colors">How Solar Works</router-link></li>
              <li><router-link to="/about#installation-types" class="hover:text-solar-400 transition-colors">Installation Types</router-link></li>
              <li><router-link to="/about#battery-storage"  class="hover:text-solar-400 transition-colors">Battery Storage</router-link></li>
              <li><router-link to="/about#funding"          class="hover:text-solar-400 transition-colors">Funding Options</router-link></li>
              <li><router-link to="/sectors"                class="hover:text-solar-400 transition-colors">Sectors</router-link></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
          <p>© {{ new Date().getFullYear() }} Kinetic Energy Consulting. All rights reserved.</p>
          <p>All calculator outputs are indicative estimates. Not a formal quotation or guarantee of performance.</p>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileOpen = ref(false)

const navLinks = [
  { to: '/',        label: 'Home' },
  { to: '/about',   label: 'About Solar' },
  { to: '/sectors', label: 'Sectors' },
  { to: '/contact', label: 'Contact' }
]

const footerPages = [
  { to: '/',           label: 'Home' },
  { to: '/about',      label: 'About Solar' },
  { to: '/sectors',    label: 'Sectors' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/contact',    label: 'Contact' }
]
</script>
