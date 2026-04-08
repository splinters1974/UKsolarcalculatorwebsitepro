<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <p class="section-kicker">Who We Work With</p>
        <h1 class="text-4xl font-bold mb-4">Solar across every sector</h1>
        <p class="text-white/70 text-lg leading-relaxed">
          From manufacturing to education, commercial solar makes sense wherever
          there's a large roof and daytime energy demand.
        </p>
      </div>
    </section>

    <!-- Sectors -->
    <div v-for="sector in sectors" :key="sector.id">
      <section :id="sector.id" class="py-16 px-4" :class="sector.bg">
        <div class="max-w-5xl mx-auto">
          <div class="grid md:grid-cols-2 gap-10 items-center">
            <div :class="{ 'md:order-2': sector.reverse }">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="sector.iconBg">
                  {{ sector.icon }}
                </div>
                <p class="section-kicker mb-0">{{ sector.kicker }}</p>
              </div>
              <h2 class="text-3xl font-bold text-navy-800 mb-4">{{ sector.title }}</h2>
              <p class="text-gray-500 leading-relaxed mb-6">{{ sector.desc }}</p>
              <ul class="space-y-2 mb-6">
                <li v-for="point in sector.points" :key="point" class="flex items-start gap-2 text-sm text-gray-700">
                  <span class="text-solar-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>{{ point }}</span>
                </li>
              </ul>
              <router-link to="/calculator" class="btn-primary text-sm px-5 py-2">
                Calculate this sector →
              </router-link>
            </div>
            <div :class="{ 'md:order-1': sector.reverse }">
              <div class="card bg-navy-900 border-navy-800 text-white">
                <p class="text-xs font-bold uppercase tracking-widest text-solar-400 mb-4">Typical figures</p>
                <div class="space-y-3">
                  <div v-for="stat in sector.stats" :key="stat.label"
                    class="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0">
                    <span class="text-sm text-white/60">{{ stat.label }}</span>
                    <span class="font-mono font-medium text-white">
                      <span class="text-solar-400">{{ stat.highlight }}</span>{{ stat.suffix }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- CTA -->
    <section class="py-16 px-4 bg-solar-500 text-white text-center">
      <h2 class="text-3xl font-bold mb-4">Calculate your site</h2>
      <p class="text-solar-100 mb-8 max-w-xl mx-auto">
        Draw your roof on satellite imagery and get a full 30-year financial model in under 3 minutes.
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <router-link to="/calculator" class="inline-block bg-white text-solar-700 font-bold px-8 py-3 rounded-lg hover:bg-solar-50 transition-colors">
          Run the Calculator Free
        </router-link>
        <router-link to="/contact" class="btn-outline-white px-8 py-3">
          Speak to an Expert
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
const sectors = [
  {
    id: 'manufacturing',
    kicker: 'Manufacturing',
    title: 'Manufacturing & Industrial',
    icon: '🏭', iconBg: 'bg-solar-100',
    bg: 'bg-white',
    reverse: false,
    desc: 'Manufacturing and industrial sites are among the best candidates for commercial solar in the UK. High daytime energy loads, large flat or pitched roof areas, and significant Scope 2 pressure create a compelling business case. Most sites can accommodate systems of 200 kWp–2 MWp, achieving payback in 4–7 years.',
    points: [
      'High daytime electricity demand aligns with peak solar generation',
      'Large, unobstructed roof areas typically available',
      'Strong Scope 2 reduction for ESG and ESOS compliance',
      'Full Expensing capital allowance available on qualifying spend',
      'Can reduce energy cost per unit of production significantly'
    ],
    stats: [
      { label: 'Typical system size', highlight: '200–1,000', suffix: ' kWp' },
      { label: 'Self-consumption rate', highlight: '80–90', suffix: '%' },
      { label: 'Typical payback', highlight: '4–7', suffix: ' years' },
      { label: 'Annual CO₂ saving', highlight: '50–250', suffix: ' tonnes' }
    ]
  },
  {
    id: 'logistics',
    kicker: 'Logistics & Warehousing',
    title: 'Logistics & Warehousing',
    icon: '🚛', iconBg: 'bg-blue-100',
    bg: 'bg-gray-50',
    reverse: true,
    desc: 'Vast, south-facing warehouse roofs offer some of the UK\'s best solar opportunities. Logistics and distribution centres typically have minimal obstructions on their large flat roofs and operate around the clock — meaning battery storage can further enhance ROI by shifting generation to peak tariff periods.',
    points: [
      'Largest available roof areas of any commercial sector',
      'Minimal shading and obstructions on modern warehouses',
      'EV charging integration for fleet electrification',
      'Battery storage complements overnight operations',
      'PPA structures available for zero-capex deployment'
    ],
    stats: [
      { label: 'Typical system size', highlight: '500–5,000', suffix: ' kWp' },
      { label: 'Roof utilisation', highlight: '60–80', suffix: '% of area' },
      { label: 'Typical payback', highlight: '5–8', suffix: ' years' },
      { label: 'Annual generation', highlight: '440–4,400', suffix: ' MWh' }
    ]
  },
  {
    id: 'retail',
    kicker: 'Retail & Leisure',
    title: 'Retail & Leisure',
    icon: '🛒', iconBg: 'bg-teal-100',
    bg: 'bg-white',
    reverse: false,
    desc: 'Retail and leisure sites benefit from solar generation that closely aligns with trading hours and peak customer footfall. Reducing grid dependency during peak tariff periods has an outsized impact on energy bills, and visible sustainability credentials increasingly influence customer choice.',
    points: [
      'Generation peaks align with trading hours and high tariff periods',
      'Strengthens sustainability brand and customer perception',
      'Canopy solar over car parks provides dual use',
      'Reduces exposure to volatile energy prices',
      'Supports net zero commitments and supply chain requirements'
    ],
    stats: [
      { label: 'Typical system size', highlight: '50–500', suffix: ' kWp' },
      { label: 'Self-consumption rate', highlight: '70–85', suffix: '%' },
      { label: 'Typical payback', highlight: '5–8', suffix: ' years' },
      { label: 'Bill reduction', highlight: '30–60', suffix: '%' }
    ]
  },
  {
    id: 'agriculture',
    kicker: 'Agriculture & Rural',
    title: 'Agriculture & Rural',
    icon: '🌾', iconBg: 'bg-green-100',
    bg: 'bg-gray-50',
    reverse: true,
    desc: 'Agricultural businesses have some of the most favourable solar conditions in the UK — large south-facing barn roofs, open land, and high daytime energy use from irrigation, refrigeration, and processing equipment. Ground-mounted and agrivoltaic systems offer additional income diversification.',
    points: [
      'Barn and polytunnel roofs typically well-oriented for solar',
      'Ground-mounted arrays utilise unproductive land',
      'Agrivoltaic systems allow dual agricultural and energy use',
      'Rural electricity tariffs often higher — greater savings potential',
      'Supports farm diversification and Rural Payments compliance'
    ],
    stats: [
      { label: 'Typical system size', highlight: '50–500', suffix: ' kWp' },
      { label: 'Installation type', highlight: 'Roof or', suffix: ' ground' },
      { label: 'Typical payback', highlight: '5–9', suffix: ' years' },
      { label: 'Annual income', highlight: '£8–80k', suffix: '/yr' }
    ]
  },
  {
    id: 'education',
    kicker: 'Education',
    title: 'Schools & Universities',
    icon: '🎓', iconBg: 'bg-solar-100',
    bg: 'bg-white',
    reverse: false,
    desc: 'Educational establishments face sustained budget pressure and increasing energy costs. Solar delivers predictable long-term savings with minimal disruption, while providing a live curriculum resource in science and sustainability. Public sector bodies can access specific green finance facilities.',
    points: [
      'Reduces school energy bills and protects teaching budgets',
      'Live STEM curriculum resource — generation data for pupils',
      'Public sector green finance available (UKIB, Salix)',
      'Demonstrates sustainability leadership to staff, pupils and parents',
      'Long operational life suited to public sector ownership models'
    ],
    stats: [
      { label: 'Typical system size', highlight: '30–250', suffix: ' kWp' },
      { label: 'Annual bill saving', highlight: '£5–40k', suffix: '/yr' },
      { label: 'Typical payback', highlight: '6–10', suffix: ' years' },
      { label: 'CO₂ saving', highlight: '10–60', suffix: ' t/yr' }
    ]
  },
  {
    id: 'healthcare',
    kicker: 'Healthcare',
    title: 'Healthcare & NHS',
    icon: '🏥', iconBg: 'bg-blue-100',
    bg: 'bg-gray-50',
    reverse: true,
    desc: 'NHS trusts and private healthcare operators face the twin pressure of rising energy costs and net zero targets. Solar provides predictable operating cost reductions, on-site resilience, and material progress towards NHS Green Plan commitments — all with minimal disruption to clinical operations.',
    points: [
      'Supports NHS net zero commitments and Green Plan targets',
      'Reduces operational costs — protecting clinical budgets',
      'On-site generation improves energy resilience',
      'Battery storage can provide emergency backup capability',
      'Public sector green finance available (NHS Shared Business Services)'
    ],
    stats: [
      { label: 'Typical system size', highlight: '50–500', suffix: ' kWp' },
      { label: 'Annual bill saving', highlight: '£8–80k', suffix: '/yr' },
      { label: 'Typical payback', highlight: '5–9', suffix: ' years' },
      { label: 'CO₂ saving', highlight: '15–120', suffix: ' t/yr' }
    ]
  }
]
</script>
