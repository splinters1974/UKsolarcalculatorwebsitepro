<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-gray-900 via-gray-800 to-solar-900 text-white py-20 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-solar-500/20 border border-solar-400/30 rounded-full px-4 py-1.5 text-solar-300 text-sm mb-6">
          <span class="w-2 h-2 bg-solar-400 rounded-full"></span>
          UK-specific solar data · PVGIS irradiance · Real roof measurements
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Calculate your solar potential<br />
          <span class="text-solar-400">with precision</span>
        </h1>
        <p class="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Draw your roof on a satellite map, and we'll calculate the exact solar panel output,
          savings, and payback period using real irradiance data for your location.
        </p>
        <a href="/calculator" class="inline-block btn-primary text-base px-8 py-3">
          Start your free calculation →
        </a>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-14 h-14 bg-solar-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mb-2">1. Find your building</h3>
            <p class="text-gray-500 text-sm">Search your address to zoom into your building on a satellite map.</p>
          </div>
          <div class="text-center">
            <div class="w-14 h-14 bg-solar-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mb-2">2. Draw your roof</h3>
            <p class="text-gray-500 text-sm">Use the drawing tool to trace the outline of your roof — we'll calculate the area automatically.</p>
          </div>
          <div class="text-center">
            <div class="w-14 h-14 bg-solar-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mb-2">3. Get your report</h3>
            <p class="text-gray-500 text-sm">We fetch real solar data for your location and generate a full PDF report with savings and payback figures.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Why use Solar Calculator Pro?</h2>
        <div class="grid sm:grid-cols-2 gap-6">
          <div class="card flex items-start gap-4">
            <div class="text-2xl">🛰️</div>
            <div>
              <h3 class="font-semibold mb-1">Real satellite imagery</h3>
              <p class="text-sm text-gray-500">Draw directly on Google Maps satellite view — measure the exact roof you want to assess.</p>
            </div>
          </div>
          <div class="card flex items-start gap-4">
            <div class="text-2xl">☀️</div>
            <div>
              <h3 class="font-semibold mb-1">Accurate irradiance data</h3>
              <p class="text-sm text-gray-500">Solar irradiance fetched live from PVGIS (European Commission) for your exact postcode location.</p>
            </div>
          </div>
          <div class="card flex items-start gap-4">
            <div class="text-2xl">📄</div>
            <div>
              <h3 class="font-semibold mb-1">Downloadable PDF report</h3>
              <p class="text-sm text-gray-500">A branded, professional report with full financial breakdown sent directly to your inbox.</p>
            </div>
          </div>
          <div class="card flex items-start gap-4">
            <div class="text-2xl">🇬🇧</div>
            <div>
              <h3 class="font-semibold mb-1">UK-specific calculations</h3>
              <p class="text-sm text-gray-500">Uses UK Ofgem unit rates, Smart Export Guarantee tariffs, and UK-average install costs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-4 bg-solar-500 text-white text-center">
      <h2 class="text-3xl font-bold mb-4">Ready to find out how much you could save?</h2>
      <p class="text-solar-100 mb-8">Free to use. No sign-up required. Takes under 5 minutes.</p>
      <a href="/calculator" class="inline-block bg-white text-solar-700 font-bold px-8 py-3 rounded-lg hover:bg-solar-50 transition-colors">
        Start your calculation →
      </a>
    </section>
  </div>
</template>
