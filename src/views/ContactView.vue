<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <p class="section-kicker">Get in Touch</p>
        <h1 class="text-4xl font-bold mb-4">Speak to an expert</h1>
        <p class="text-white/70 text-lg">
          Have a question or want a detailed site assessment? We're happy to help.
        </p>
      </div>
    </section>

    <section class="py-16 px-4">
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">

        <!-- Contact form -->
        <div class="card">
          <h2 class="text-xl font-bold text-navy-800 mb-1">Send us a message</h2>
          <p class="text-sm text-gray-500 mb-6">We aim to respond within one working day.</p>

          <form v-if="!submitted" @submit.prevent="submit" novalidate class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Full name <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" class="form-input" placeholder="Jane Smith" required />
                <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
              </div>
              <div>
                <label class="form-label">Company <span class="text-red-500">*</span></label>
                <input v-model="form.company" type="text" class="form-input" placeholder="Acme Ltd" required />
                <p v-if="errors.company" class="text-xs text-red-600 mt-1">{{ errors.company }}</p>
              </div>
              <div>
                <label class="form-label">Email <span class="text-red-500">*</span></label>
                <input v-model="form.email" type="email" class="form-input" placeholder="jane@example.com" required />
                <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>
              </div>
              <div>
                <label class="form-label">Telephone</label>
                <input v-model="form.telephone" type="tel" class="form-input" placeholder="07700 900000" />
              </div>
            </div>

            <div>
              <label class="form-label">Sector</label>
              <select v-model="form.sector" class="form-input">
                <option value="">Select your sector…</option>
                <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div>
              <label class="form-label">Message <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.message"
                class="form-input resize-none"
                rows="5"
                placeholder="Tell us about your site — roof area, energy use, any questions…"
                required
              ></textarea>
              <p v-if="errors.message" class="text-xs text-red-600 mt-1">{{ errors.message }}</p>
            </div>

            <p v-if="submitError" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {{ submitError }}
            </p>

            <div v-if="isDevMode" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <span>🔧</span>
              <span>Dev mode — Formspree not configured. Message will not send but form will proceed.</span>
            </div>

            <button type="submit" class="btn-primary w-full py-3" :disabled="submitting">
              <span v-if="submitting" class="flex items-center gap-2 justify-center">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Sending…
              </span>
              <span v-else>Send message →</span>
            </button>
          </form>

          <!-- Success -->
          <div v-else class="text-center py-8">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-navy-800 mb-2">Message sent</h3>
            <p class="text-gray-500 text-sm mb-6">Thanks, {{ form.name.split(' ')[0] }}. We'll be in touch within one working day.</p>
            <router-link to="/calculator" class="btn-primary text-sm px-6 py-2">
              Run the calculator →
            </router-link>
          </div>
        </div>

        <!-- Contact info + why contact -->
        <div class="space-y-6">
          <div class="card bg-navy-900 border-navy-800 text-white">
            <p class="text-xs font-bold uppercase tracking-widest text-solar-400 mb-4">Contact Details</p>
            <div class="space-y-4">
              <a href="mailto:martynsheridan621@gmail.com"
                class="flex items-start gap-3 hover:text-solar-400 transition-colors">
                <svg class="w-5 h-5 flex-shrink-0 text-solar-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <div>
                  <p class="text-xs text-white/50 mb-0.5">Email</p>
                  <p class="text-sm">martynsheridan621@gmail.com</p>
                </div>
              </a>
              <a href="tel:+447872015769"
                class="flex items-start gap-3 hover:text-solar-400 transition-colors">
                <svg class="w-5 h-5 flex-shrink-0 text-solar-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <div>
                  <p class="text-xs text-white/50 mb-0.5">Phone</p>
                  <p class="text-sm">+44 (0) 7872 015769</p>
                </div>
              </a>
              <a href="https://www.linkedin.com/in/martynsheridan" target="_blank" rel="noopener"
                class="flex items-start gap-3 hover:text-solar-400 transition-colors">
                <svg class="w-5 h-5 flex-shrink-0 text-solar-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <div>
                  <p class="text-xs text-white/50 mb-0.5">LinkedIn</p>
                  <p class="text-sm">linkedin.com/in/martynsheridan</p>
                </div>
              </a>
            </div>
          </div>

          <div class="card">
            <h3 class="font-bold text-navy-800 mb-4">What happens next?</h3>
            <div class="space-y-4">
              <div v-for="(step, i) in nextSteps" :key="i" class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-solar-100 flex items-center justify-center text-solar-700 font-bold text-xs flex-shrink-0 mt-0.5">
                  {{ i + 1 }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ step.title }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-solar-50 border border-solar-200 rounded-xl p-5 text-center">
            <p class="text-sm font-semibold text-solar-800 mb-2">Not ready to chat yet?</p>
            <p class="text-xs text-solar-700 mb-4">Run the free calculator first — get an instant estimate for your site in under 3 minutes.</p>
            <router-link to="/calculator" class="btn-primary text-sm px-5 py-2">
              Run the Calculator →
            </router-link>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const submitted  = ref(false)
const submitting = ref(false)
const submitError = ref('')

const form = reactive({
  name: '', company: '', email: '', telephone: '', sector: '', message: ''
})
const errors = reactive({})

const FORMSPREE = import.meta.env.VITE_FORMSPREE_ENDPOINT
const isDevMode = computed(() => !FORMSPREE || FORMSPREE.includes('PLACEHOLDER'))

const sectors = [
  'Manufacturing', 'Logistics & Warehousing', 'Retail & Leisure',
  'Agriculture & Rural', 'Education', 'Healthcare', 'Other'
]

const nextSteps = [
  { title: 'We review your enquiry', desc: 'We read every message and respond personally within one working day.' },
  { title: 'Initial consultation call', desc: 'A short call to understand your site, energy use, and objectives.' },
  { title: 'No-obligation site assessment', desc: 'We visit your site, assess suitability, and produce a detailed financial model.' },
  { title: 'Proposal & installation', desc: 'Full project management from design through to commissioning.' }
]

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim())    errors.name    = 'Name is required.'
  if (!form.company.trim()) errors.company = 'Company is required.'
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                             errors.email   = 'Valid email required.'
  if (!form.message.trim()) errors.message = 'Please include a message.'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''

  try {
    if (!isDevMode.value) {
      const res = await fetch(FORMSPREE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name:      form.name,
          Company:   form.company,
          Email:     form.email,
          Telephone: form.telephone || '—',
          Sector:    form.sector    || '—',
          Message:   form.message,
          _subject:  `Contact enquiry — ${form.company} (${form.name})`,
          _replyto:  form.email
        })
      })
      if (!res.ok) throw new Error(`Server error ${res.status}. Please try again.`)
    } else {
      console.log('[DEV] Contact form:', { ...form })
    }
    submitted.value = true
  } catch (err) {
    submitError.value = err.message || 'Something went wrong. Please try again or email us directly.'
  } finally {
    submitting.value = false
  }
}
</script>
