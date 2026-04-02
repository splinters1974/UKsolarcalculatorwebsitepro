<template>
  <form @submit.prevent="submit" class="space-y-4">
    <h2 class="text-xl font-bold text-gray-900">Your details</h2>
    <p class="text-sm text-gray-500">We'll send your personalised solar report to your email address.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Name -->
      <div>
        <label class="form-label">Full name <span class="text-red-500">*</span></label>
        <input v-model="form.name" type="text" class="form-input" placeholder="Jane Smith" required />
      </div>

      <!-- Email -->
      <div>
        <label class="form-label">Email address <span class="text-red-500">*</span></label>
        <input v-model="form.email" type="email" class="form-input" placeholder="jane@example.com" required />
      </div>

      <!-- Company -->
      <div>
        <label class="form-label">Company <span class="text-red-500">*</span></label>
        <input v-model="form.company" type="text" class="form-input" placeholder="Acme Ltd" required />
      </div>

      <!-- Job Title -->
      <div>
        <label class="form-label">Job title <span class="text-red-500">*</span></label>
        <input v-model="form.jobTitle" type="text" class="form-input" placeholder="Facilities Manager" required />
      </div>

      <!-- Telephone -->
      <div>
        <label class="form-label">Telephone <span class="text-red-500">*</span></label>
        <input v-model="form.telephone" type="tel" class="form-input" placeholder="07700 900000" required />
      </div>
    </div>

    <!-- Additional info -->
    <div>
      <label class="form-label">Additional information <span class="text-gray-400 font-normal">(optional)</span></label>
      <textarea
        v-model="form.additionalInfo"
        class="form-input resize-none"
        rows="3"
        placeholder="e.g. flat roof, planning constraints, budget…"
      ></textarea>
    </div>

    <!-- Privacy notice -->
    <p class="text-xs text-gray-400">
      By submitting this form you agree to receive your solar report by email. We will not share your details with third parties.
    </p>

    <!-- Error -->
    <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{{ errorMsg }}</p>

    <!-- Submit -->
    <button type="submit" class="btn-primary w-full py-3" :disabled="submitting">
      <span v-if="submitting" class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Sending…
      </span>
      <span v-else>See my solar results →</span>
    </button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  calculationSummary: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submitted'])

const submitting = ref(false)
const errorMsg = ref('')

const form = reactive({
  name: '',
  email: '',
  company: '',
  jobTitle: '',
  telephone: '',
  additionalInfo: ''
})

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT

async function submit() {
  submitting.value = true
  errorMsg.value = ''

  try {
    // Build the submission payload — include key calculation data for our records
    const payload = {
      ...form,
      // Calculation summary for our records
      _subject: `Solar Calculator Report — ${form.company}`,
      roofAreaM2: props.calculationSummary.roofAreaM2,
      systemKwp: props.calculationSummary.systemKwp,
      annualGenerationKwh: props.calculationSummary.annualGenerationKwh,
      totalAnnualBenefit: props.calculationSummary.totalAnnualBenefit,
      paybackYears: props.calculationSummary.paybackYears,
      roofOrientation: props.calculationSummary.compassDirection,
      irradianceKwhM2y: props.calculationSummary.irradianceKwhM2y,
      submittedAt: new Date().toISOString()
    }

    if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('PLACEHOLDER')) {
      // Dev mode: skip Formspree, proceed directly
      console.log('[DEV] Formspree submission skipped. Payload:', payload)
      emit('submitted', { ...form })
      return
    }

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Form submission failed. Please try again.')
    }

    emit('submitted', { ...form })
  } catch (err) {
    errorMsg.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
