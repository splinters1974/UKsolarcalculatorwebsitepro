<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-gray-900 to-slate-800 text-white py-16 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-400 mb-3">About Solar</p>
        <h1 class="text-4xl font-bold mb-4">How commercial solar works</h1>
        <p class="text-gray-300 text-lg leading-relaxed">
          Everything UK businesses need to understand about solar PV — how it generates electricity,
          what it costs, and how to fund it.
        </p>
      </div>
    </section>

    <!-- How solar works -->
    <section id="how-it-works" class="py-16 px-4 bg-white">
      <div class="max-w-4xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">The Basics</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-6">How solar PV generates electricity</h2>
        <div class="grid md:grid-cols-2 gap-8 items-start">
          <div class="prose prose-sm text-gray-600 space-y-4">
            <p>Solar photovoltaic (PV) panels convert sunlight directly into electricity using semiconductor cells — typically silicon. When photons from sunlight strike the panel, they knock electrons loose, creating a direct current (DC) flow.</p>
            <p>An inverter converts this DC electricity into AC power compatible with your building's electrical system. Any electricity generated is used on-site first, displacing grid electricity you'd otherwise pay for.</p>
            <p>Surplus generation not used on-site is automatically exported to the National Grid, earning revenue under the <strong>Smart Export Guarantee (SEG)</strong> — typically 12–20p/kWh depending on your energy supplier.</p>
          </div>
          <div class="space-y-3">
            <div v-for="step in howItWorksSteps" :key="step.num"
              class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div class="w-8 h-8 rounded-full bg-solar-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{{ step.num }}</div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">{{ step.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key performance factors -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">What Affects Output</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-10">Factors that determine generation</h2>
        <div class="grid sm:grid-cols-2 gap-5">
          <div v-for="factor in performanceFactors" :key="factor.title" class="card">
            <div class="flex items-start gap-3">
              <span class="text-2xl">{{ factor.icon }}</span>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">{{ factor.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ factor.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Installation types -->
    <section id="installation-types" class="py-16 px-4 bg-white">
      <div class="max-w-4xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">Installation Types</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-10">Types of commercial solar installation</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="type in installTypes" :key="type.title" class="card">
            <div class="text-3xl mb-4">{{ type.icon }}</div>
            <h3 class="font-bold text-gray-900 mb-2">{{ type.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ type.desc }}</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in type.tags" :key="tag"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Battery storage -->
    <section id="battery-storage" class="py-16 px-4 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">Battery Storage</p>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Maximise self-consumption with battery storage</h2>
            <p class="text-gray-500 mb-4 leading-relaxed">Battery storage systems allow surplus solar generation to be stored on-site and used later — reducing export and increasing the amount of your own low-cost solar electricity you consume.</p>
            <p class="text-gray-500 mb-6 leading-relaxed">For commercial sites with evening or overnight operations, batteries can significantly improve ROI by displacing higher peak-rate grid electricity. They also provide resilience against grid outages.</p>
            <div class="space-y-3">
              <div v-for="benefit in batteryBenefits" :key="benefit" class="flex items-start gap-2 text-sm text-gray-700">
                <span class="text-green-500 font-bold mt-0.5">✓</span>
                <span>{{ benefit }}</span>
              </div>
            </div>
          </div>
          <div class="card bg-solar-50 border-solar-200">
            <h3 class="font-bold text-solar-900 mb-4">Battery storage in numbers</h3>
            <div class="space-y-4">
              <div v-for="stat in batteryStats" :key="stat.label" class="flex justify-between items-center py-2 border-b border-solar-100 last:border-0">
                <span class="text-sm text-solar-700">{{ stat.label }}</span>
                <span class="font-bold text-solar-900">{{ stat.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Funding options -->
    <section id="funding" class="py-16 px-4 bg-white">
      <div class="max-w-4xl mx-auto">
        <p class="text-xs font-bold uppercase tracking-widest text-solar-500 mb-3">Funding Options</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-4">How to fund a commercial solar installation</h2>
        <p class="text-gray-500 mb-10 max-w-2xl">There is no single right answer — the best funding model depends on your capital position, appetite for ownership, and long-term energy strategy.</p>
        <div class="grid sm:grid-cols-2 gap-6">
          <div v-for="option in fundingOptions" :key="option.title" class="card">
            <div class="flex items-start gap-3 mb-3">
              <span class="text-2xl">{{ option.icon }}</span>
              <div>
                <h3 class="font-bold text-gray-900">{{ option.title }}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="option.badgeClass">{{ option.badge }}</span>
              </div>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ option.desc }}</p>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-green-50 rounded p-2"><p class="font-semibold text-green-800 mb-0.5">Pros</p><p class="text-green-700">{{ option.pros }}</p></div>
              <div class="bg-red-50 rounded p-2"><p class="font-semibold text-red-800 mb-0.5">Cons</p><p class="text-red-700">{{ option.cons }}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-4 bg-solar-500 text-white text-center">
      <h2 class="text-3xl font-bold mb-4">See what solar could do for your site</h2>
      <p class="text-solar-100 mb-8 max-w-xl mx-auto">Use our Pro calculator to draw your roof on satellite imagery and get a full 30-year financial model in under 3 minutes.</p>
      <a href="/calculator" class="inline-block bg-white text-solar-700 font-bold px-8 py-3 rounded-lg hover:bg-solar-50 transition-colors">
        Run the Calculator Free →
      </a>
    </section>

  </div>
</template>

<script setup>
const howItWorksSteps = [
  { num: 1, title: 'Sunlight hits the panels',        desc: 'Photovoltaic cells in each panel convert solar radiation into DC electricity.' },
  { num: 2, title: 'Inverter converts to AC',          desc: 'A grid-tied inverter converts DC output to 230V/50Hz AC for your building.' },
  { num: 3, title: 'Building uses solar first',        desc: 'Generated electricity powers your site loads — displacing grid electricity.' },
  { num: 4, title: 'Surplus exported to grid',         desc: 'Any excess is automatically exported, earning SEG income from your supplier.' },
  { num: 5, title: 'Grid covers any shortfall',        desc: 'On cloudy days or overnight, the grid supplies as normal — seamlessly.' }
]

const performanceFactors = [
  {
    icon: '🌍', title: 'Location & latitude',
    desc: 'UK solar irradiance ranges from ~840 kWh/m²/yr in the Scottish Highlands to ~1,150 kWh/m²/yr on the South Coast. The Pro calculator fetches your exact location\'s irradiance from PVGIS (European Commission).'
  },
  {
    icon: '🧭', title: 'Roof orientation',
    desc: 'South-facing roofs capture maximum annual irradiance. East/west-facing surfaces generate ~85% of south-facing output. North-facing roofs should generally be avoided for solar.'
  },
  {
    icon: '📐', title: 'Roof tilt/pitch',
    desc: 'An optimal tilt angle of 30–35° maximises annual generation for UK latitudes. Flat roofs can use angled mounting frames to achieve the optimum angle.'
  },
  {
    icon: '🌑', title: 'Shading',
    desc: 'Even partial shading on one panel can reduce whole-string output. Nearby trees, plant rooms, and neighbouring buildings should be assessed during a site survey.'
  },
  {
    icon: '🌡️', title: 'Temperature',
    desc: 'Solar panels are less efficient at high temperatures. UK\'s cool climate is beneficial — panels here typically outperform equivalent systems in hotter countries per kWp.'
  },
  {
    icon: '⚙️', title: 'System losses',
    desc: 'Inverter efficiency, DC/AC cabling losses, and soiling typically reduce real-world output to around 82–85% of theoretical maximum — captured in the performance ratio.'
  }
]

const installTypes = [
  {
    icon: '🏢', title: 'Rooftop (Pitched)',
    desc: 'Panels mounted on angled brackets on an existing pitched roof. Most common for commercial and industrial buildings. Minimal structural impact.',
    tags: ['Warehouses', 'Factories', 'Offices']
  },
  {
    icon: '🏗️', title: 'Rooftop (Flat)',
    desc: 'Panels on ballasted or mechanically fixed frames on flat roofs, angled to the optimal tilt. Higher initial cost but often the largest available area.',
    tags: ['Retail', 'Logistics', 'Hospitals']
  },
  {
    icon: '🚗', title: 'Car Park Canopy',
    desc: 'Solar canopies over car parks generate electricity while providing covered parking. Premium cost but strong ESG value and no roof loading constraints.',
    tags: ['Retail', 'Leisure', 'Education']
  },
  {
    icon: '🌱', title: 'Ground-Mounted',
    desc: 'Panels on freestanding frames on unused land. Optimal orientation and tilt achievable. Requires planning permission and suitable land.',
    tags: ['Agriculture', 'Rural sites', 'Industrial']
  },
  {
    icon: '🏭', title: 'Integrated (BIPV)',
    desc: 'Solar panels replacing traditional roofing or cladding materials. Higher cost but aesthetically superior for customer-facing buildings.',
    tags: ['New-build', 'Retrofit', 'Heritage']
  },
  {
    icon: '🌾', title: 'Agrivoltaic',
    desc: 'Panels mounted at height over agricultural land, allowing dual use for both food production and energy generation. An emerging model in UK farming.',
    tags: ['Agriculture', 'Horticulture']
  }
]

const batteryBenefits = [
  'Increases self-consumption from ~75% to 85–95% for most commercial sites',
  'Provides resilience against grid outages',
  'Enables peak demand shaving — reducing costly demand charges',
  'Can participate in grid flexibility services (TRIAD, FFR) for additional revenue',
  'Qualifies for full expensing capital allowances under current HMRC rules'
]

const batteryStats = [
  { label: 'Self-consumption uplift',   value: '+10–20%' },
  { label: 'Typical cycle life',         value: '4,000–6,000 cycles' },
  { label: 'Warranty period',            value: '10 years' },
  { label: 'Cost (per kWh capacity)',    value: '£300–£500/kWh' },
  { label: 'Payback vs solar alone',     value: '+1–2 years' }
]

const fundingOptions = [
  {
    icon: '💷', title: 'Capital Purchase',
    badge: 'Best ROI', badgeClass: 'bg-green-100 text-green-800',
    desc: 'Business purchases and owns the system outright. Eligible for 100% First Year Allowance under Full Expensing, significantly reducing the effective net cost for profitable businesses.',
    pros: 'Maximum long-term savings, full ownership, best ROI',
    cons: 'Requires upfront capital; balance sheet impact'
  },
  {
    icon: '📄', title: 'Power Purchase Agreement (PPA)',
    badge: 'Zero capex', badgeClass: 'bg-blue-100 text-blue-800',
    desc: 'A third-party installs and owns the system on your roof. You buy the electricity it generates at a fixed, below-market rate for 10–25 years.',
    pros: 'No capital required, guaranteed savings from day one',
    cons: 'Lower savings than ownership; long-term contract'
  },
  {
    icon: '🤝', title: 'Solar Finance / Lease',
    badge: 'Flexible', badgeClass: 'bg-solar-100 text-solar-800',
    desc: 'Asset finance or lease agreements spread the capital cost over 3–10 years. You own the system at the end of the term.',
    pros: 'Preserves capital, fixed payments, ownership at end',
    cons: 'Interest cost; credit approval required'
  },
  {
    icon: '🏦', title: 'Green Loans / UKIB',
    badge: 'Government-backed', badgeClass: 'bg-purple-100 text-purple-800',
    desc: 'The UK Infrastructure Bank and British Business Bank offer subsidised green lending. Local authorities and housing providers can access specific funds at preferential rates.',
    pros: 'Lower interest rates, government support available',
    cons: 'Application process; eligibility criteria apply'
  }
]
</script>
