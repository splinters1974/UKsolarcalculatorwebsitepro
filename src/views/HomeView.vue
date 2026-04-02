<template>
  <div>

    <!-- Hero -->
    <section class="bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950 text-white py-20 px-4 relative overflow-hidden">
      <!-- Subtle dot grid -->
      <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 28px 28px;"></div>
      <div class="max-w-5xl mx-auto relative z-10 text-center">
        <div class="inline-flex items-center gap-2 bg-solar-500/20 border border-solar-400/30 rounded-full px-4 py-1.5 text-solar-300 text-sm mb-6 font-medium tracking-wide uppercase" style="font-size:0.72rem;letter-spacing:0.1em;">
          <span class="w-2 h-2 bg-solar-400 rounded-full animate-pulse"></span>
          UK Industrial &amp; Commercial Solar
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
          Calculate Your Commercial<br/>
          <span class="text-solar-400">Solar ROI with Precision</span>
        </h1>
        <p class="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Draw your roof directly on a satellite map — get an instant payback period,
          30-year savings forecast, and carbon figures based on real solar irradiance
          data for your exact location.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <a href="/calculator" class="inline-flex items-center gap-2 btn-primary text-base px-8 py-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <polyline points="12 8 12 12 14 14" stroke-width="2"/>
            </svg>
            Run the Calculator
          </a>
          <a href="/about" class="inline-flex items-center gap-2 btn-secondary text-base px-8 py-3">
            Learn How Solar Works
          </a>
        </div>
      </div>
    </section>

    <!-- Stats band -->
    <div class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="text-center py-6 px-4 border-r border-gray-100 last:border-0">
          <p class="text-2xl font-bold text-solar-600">{{ stat.value }}</p>
          <p class="text-xs text-gray-500 mt-1 leading-snug">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Why commercial solar -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-5xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">Why Commercial Solar</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-3">A genuine return, not just a green gesture</h2>
        <p class="text-gray-500 mb-10 max-w-2xl">Commercial and industrial solar in the UK now offers a compelling business case independent of subsidies. Here's why businesses are acting now.</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="feature in features" :key="feature.title" class="card hover:shadow-md transition-shadow">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4" :class="feature.iconBg">
              <span class="text-xl">{{ feature.icon }}</span>
            </div>
            <h3 class="font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="max-w-5xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">The Process</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-3">From estimate to <span class="text-solar-500">energised system</span></h2>
        <p class="text-gray-500 mb-12 max-w-2xl">Our Pro calculator gives you a detailed first estimate using your actual roof. From there, we walk through every step.</p>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(step, i) in steps" :key="i" class="text-center">
            <div class="w-16 h-16 rounded-full bg-white border-2 border-solar-400 flex items-center justify-center mx-auto mb-5 font-mono font-medium text-solar-600 text-lg shadow-sm">
              {{ String(i + 1).padStart(2, '0') }}
            </div>
            <h3 class="font-bold text-gray-900 mb-2">{{ step.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sectors -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-5xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">Who We Work With</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-3">Solar across <span class="text-solar-500">every sector</span></h2>
        <p class="text-gray-500 mb-10 max-w-2xl">From manufacturing to education, commercial solar makes sense wherever there's a large roof and daytime energy demand.</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="sector in sectors" :key="sector.name"
            class="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-solar-300 hover:shadow-sm transition-all cursor-pointer">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" :class="sector.iconBg">
              <span class="text-xl">{{ sector.icon }}</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">{{ sector.name }}</h3>
              <p class="text-xs text-gray-500 leading-relaxed">{{ sector.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Example scenario -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="max-w-5xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">Example Scenario</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-10">500 kWp warehouse system</h2>
        <div class="grid md:grid-cols-2 gap-6 items-start">
          <div class="card">
            <div class="space-y-4">
              <div v-for="row in exampleRows" :key="row.label"
                class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <span class="text-sm text-gray-600">{{ row.label }}</span>
                <span class="font-bold text-gray-900 font-mono">{{ row.value }}</span>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-xl p-5">
              <p class="text-sm font-semibold text-green-800 mb-1">Strong, predictable returns</p>
              <p class="text-sm text-green-700">A well-designed commercial system delivers a genuine, measurable ROI over a predictable timeframe. Output can be modelled with confidence before a panel is installed.</p>
            </div>
            <div class="bg-solar-50 border border-solar-200 rounded-xl p-5">
              <p class="text-sm font-semibold text-solar-800 mb-1">Pro version advantage</p>
              <p class="text-sm text-solar-700">The Pro calculator draws your actual roof outline on a satellite map and fetches real solar irradiance for your exact location — far more accurate than regional averages.</p>
            </div>
            <a href="/calculator" class="btn-primary w-full text-center py-3 block">
              Calculate your site →
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-4 bg-solar-500 text-white text-center">
      <h2 class="text-3xl font-bold mb-4">Ready to see the numbers for your site?</h2>
      <p class="text-solar-100 mb-8 max-w-xl mx-auto">Free, detailed financial modelling for UK businesses. Draw your roof on a satellite map and get a downloadable report in under 3 minutes.</p>
      <div class="flex flex-wrap gap-4 justify-center">
        <a href="/calculator" class="inline-block bg-white text-solar-700 font-bold px-8 py-3 rounded-lg hover:bg-solar-50 transition-colors">
          Run the Calculator Free
        </a>
        <a href="/about" class="inline-block border border-white/50 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
          Learn How Solar Works
        </a>
      </div>
    </section>

  </div>
</template>

<script setup>
const stats = [
  { value: '4–6yr',  label: 'Typical payback period on a solar project' },
  { value: '30+yr',  label: 'Typical operational lifespan of a solar project' },
  { value: '£85k',   label: 'Average annual savings on a 500 kWp system' },
  { value: '62t CO₂', label: 'Annual carbon savings on a 500 kWp system' }
]

const features = [
  {
    icon: '📈', iconBg: 'bg-solar-100',
    title: 'Lock in energy costs',
    desc: 'Grid electricity prices have risen sharply and remain volatile. On-site solar generation provides a hedge against further increases, giving finance teams greater cost certainty.'
  },
  {
    icon: '🌿', iconBg: 'bg-green-100',
    title: 'Meet carbon targets',
    desc: 'ESOS, SECR, and supply chain pressure are driving Scope 2 emission reductions. Rooftop solar is the most direct, measurable action most businesses can take.'
  },
  {
    icon: '🔬', iconBg: 'bg-blue-100',
    title: 'Mature, proven technology',
    desc: 'Solar panels have been commercially deployed for over two decades. Failure rates are low, warranties long, and the UK installer market is competitive and well-established.'
  },
  {
    icon: '💰', iconBg: 'bg-emerald-100',
    title: 'Strong, predictable returns',
    desc: 'A well-designed commercial system delivers a genuine, measurable ROI over a predictable timeframe. Output can be modelled with confidence before a panel is installed.'
  },
  {
    icon: '🏦', iconBg: 'bg-solar-100',
    title: 'Flexible financing options',
    desc: 'From capital purchase to Power Purchase Agreements (PPA), lease, or finance packages, there are structures to suit every business — including zero-capex options.'
  },
  {
    icon: '🏭', iconBg: 'bg-gray-100',
    title: 'Uses existing roof space',
    desc: 'Rooftop and canopy installations require no additional land. Industrial units, warehouses, and retail sites typically have large, south-facing roof areas ideal for solar.'
  }
]

const steps = [
  {
    title: 'Run the Calculator',
    desc: 'Draw your roof outline on satellite imagery. The Pro calculator fetches real solar irradiance for your exact location and models generation, savings, payback, and carbon impact.'
  },
  {
    title: 'Site Survey & Design',
    desc: 'We conduct a no-obligation site assessment, confirm structural suitability, assess shading, and produce a detailed financial model for your specific site.'
  },
  {
    title: 'Installation & Commissioning',
    desc: 'We manage the full project — design, MCS-accredited installation, DNO notification, and commissioning — so you can focus on your business.'
  }
]

const sectors = [
  { icon: '🏭', iconBg: 'bg-solar-100', name: 'Manufacturing', desc: 'High daytime loads, large flat roofs, and significant Scope 2 pressure make manufacturing sites ideal candidates.' },
  { icon: '🚛', iconBg: 'bg-blue-100',  name: 'Logistics & Warehousing', desc: 'Vast, south-facing warehouse roofs offer some of the UK\'s best solar opportunities, with minimal on-site disruption.' },
  { icon: '🛒', iconBg: 'bg-teal-100',  name: 'Retail & Leisure', desc: 'Solar generation aligned with trading hours reduces peak grid demand and strengthens sustainability credentials.' },
  { icon: '🌾', iconBg: 'bg-green-100', name: 'Agriculture & Rural', desc: 'Barn roofs, polytunnel carports, and ground-mounted arrays offer farmers diversified income and reduced energy costs.' },
  { icon: '🎓', iconBg: 'bg-solar-100', name: 'Education', desc: 'Schools and universities benefit from reduced energy bills, curriculum engagement, and demonstrable sustainability leadership.' },
  { icon: '🏥', iconBg: 'bg-blue-100',  name: 'Healthcare', desc: 'Predictable operating costs, resilience benefits, and NHS net zero targets make solar a natural fit for health facilities.' }
]

const exampleRows = [
  { label: 'System size',         value: '500 kWp' },
  { label: 'Annual generation',   value: '~440,000 kWh' },
  { label: 'Year 1 savings',      value: '~£88,000' },
  { label: 'Simple payback',      value: '6–8 years' },
  { label: '30-year NPV',         value: '£900k+' },
  { label: 'CO₂ avoided/year',    value: '~103 tonnes' }
]
</script>
