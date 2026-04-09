/**
 * PDF Report Generator — Commercial & Industrial Solar
 * Supports the calculateSolar() results format with capital + PPA models.
 */

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { formatGbp, formatNumber } from './calculatorService'

const BRAND_AMBER = [245, 158, 11]
const BRAND_DARK  = [17, 24, 39]
const BRAND_GREEN = [22, 163, 74]
const BRAND_GRAY  = [107, 114, 128]
const BRAND_BLUE  = [37, 99, 235]

/**
 * @param {object} opts
 * @param {object} opts.results       - Output of calculateSolar()
 * @param {object} opts.siteData      - { buildings, irradianceKwhM2y, monthlyData, lat, lng }
 * @param {object} opts.userDetails   - { name, email, company, jobTitle, telephone, additionalInfo }
 * @param {number} opts.unitRatePence - Grid rate p/kWh
 * @param {string} opts.fundingModel  - 'capital' | 'ppa'
 * @param {number} opts.ppaDuration   - 10 | 15 | 20 | 25
 */
export async function generatePDF({
  results, siteData, userDetails,
  unitRatePence, fundingModel = 'capital', ppaDuration = 20
}) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M     = 20  // margin

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_AMBER)
  doc.rect(0, 0, pageW, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('UK Solar Calculator Pro', M, 14)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Commercial & Industrial Solar Estimate Report', M, 22)

  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(dateStr, pageW - M, 22, { align: 'right' })

  // ── Prepared for ──────────────────────────────────────────────────────────
  let y = 44
  doc.setTextColor(...BRAND_DARK)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Prepared for:', M, y)

  doc.setFont('helvetica', 'normal')
  y += 5
  doc.text(`${userDetails.name}  ·  ${userDetails.company}  ·  ${userDetails.jobTitle}`, M, y)
  y += 5
  doc.text(`${userDetails.email}  ·  ${userDetails.telephone}`, M, y)

  if (userDetails.additionalInfo) {
    y += 5
    doc.setTextColor(...BRAND_GRAY)
    doc.text(`Notes: ${userDetails.additionalInfo}`, M, y, { maxWidth: pageW - M * 2 })
    doc.setTextColor(...BRAND_DARK)
  }

  // ── Key metric boxes ───────────────────────────────────────────────────────
  y += 10
  const boxW = (pageW - M * 2 - 9) / 4
  const metrics = [
    { label: 'Panels',         value: `${results.totalPanelCount}`,                      sub: `${results.totalSystemKwp} kWp` },
    { label: 'Generation',     value: `${formatNumber(results.annualGenerationKwh)}`,     sub: 'kWh/year' },
    { label: 'Annual Savings', value: formatGbp(results.capital.annualSavings),           sub: `${unitRatePence}p/kWh` },
    { label: 'Payback',        value: `${results.capital.paybackYears} yrs`,             sub: 'Capital purchase' }
  ]

  metrics.forEach((m, i) => {
    const x = M + i * (boxW + 3)
    doc.setFillColor(255, 251, 235)
    doc.roundedRect(x, y, boxW, 22, 2, 2, 'F')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRAND_AMBER)
    doc.text(m.value, x + boxW / 2, y + 10, { align: 'center' })

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...BRAND_GRAY)
    doc.text(m.label, x + boxW / 2, y + 16, { align: 'center' })
    doc.text(m.sub,   x + boxW / 2, y + 20, { align: 'center' })
  })

  // ── 30-year profit highlight ───────────────────────────────────────────────
  y += 28
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(M, y, pageW - M * 2, 14, 2, 2, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_GREEN)
  doc.text(`30-year net profit: ${formatGbp(results.capital.thirtyYearProfit)}`, M + 4, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...BRAND_GRAY)
  doc.text(
    `${formatGbp(results.capital.thirtyYearGross)} gross receipts minus ${formatGbp(results.capital.installCostGbp)} install cost`,
    M + 4, y + 11
  )

  // ── Capital financial table ────────────────────────────────────────────────
  y += 20
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_DARK)
  doc.text('Capital Purchase — Financial Breakdown', M, y)

  y += 3
  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [['Description', 'Value']],
    body: [
      ['Estimated install cost',                                    formatGbp(results.capital.installCostGbp)],
      [`Annual savings (self-consumption at ${unitRatePence}p/kWh)`, `+${formatGbp(results.capital.annualSavings)}`],
      ['Annual SEG export income (5p/kWh)',                         `+${formatGbp(results.capital.exportIncomeSEG)}`],
      ['Total annual benefit',                                      formatGbp(results.capital.totalAnnualBenefit)],
      ['Payback period',                                            `${results.capital.paybackYears} years`],
      ['30-year gross receipts',                                    formatGbp(results.capital.thirtyYearGross)],
      ['30-year net profit',                                        formatGbp(results.capital.thirtyYearProfit)]
    ],
    headStyles: { fillColor: BRAND_AMBER, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
  })

  // ── PPA section ───────────────────────────────────────────────────────────
  y = doc.lastAutoTable.finalY + 8
  if (y + 30 > pageH - 20) { doc.addPage(); y = 20 }

  const ppaContract = results.ppa.contracts[ppaDuration]
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_DARK)
  doc.text(`PPA Alternative — ${ppaDuration}-Year Contract`, M, y)

  y += 3
  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [['Description', 'Value']],
    body: [
      ['Your grid rate',                         `${unitRatePence}p/kWh`],
      ['PPA rate (20% discount)',                 `${results.ppa.ppaRatePence}p/kWh`],
      ['Year 1 annual saving',                    formatGbp(results.ppa.annualSavingY1)],
      [`Total saving over ${ppaDuration} years`,  formatGbp(ppaContract?.totalSaving ?? 0)],
      ['Upfront cost to customer',               '£0 — developer funded']
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
  })

  // ── Buildings table (when >1 building) ────────────────────────────────────
  if (results.buildings.length > 1) {
    y = doc.lastAutoTable.finalY + 8
    if (y + 20 > pageH - 20) { doc.addPage(); y = 20 }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRAND_DARK)
    doc.text('Buildings on Site', M, y)

    y += 3
    doc.autoTable({
      startY: y,
      margin: { left: M, right: M },
      head: [['Building', 'Roof Area', 'Orientation', 'Pitch', 'System', 'Generation']],
      body: results.buildings.map(b => [
        b.name,
        `${Math.round(b.roofAreaM2)} m²`,
        b.compassDirection,
        `${b.roofTiltDeg}°`,
        `${b.systemKwp} kWp`,
        `${formatNumber(b.annualKwh)} kWh/yr`
      ]),
      headStyles: { fillColor: BRAND_AMBER, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    })
  }

  // ── System details table ───────────────────────────────────────────────────
  y = doc.lastAutoTable.finalY + 8
  if (y + 30 > pageH - 20) { doc.addPage(); y = 20 }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_DARK)
  doc.text('System Details', M, y)

  y += 3
  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [['Parameter', 'Value']],
    body: [
      ['Total roof area',           `${Math.round(results.totalRoofAreaM2)} m²`],
      ['Usable roof area (70%)',     `${results.totalUsableAreaM2} m²`],
      ['Solar irradiance (PVGIS)',   `${siteData.irradianceKwhM2y} kWh/m²/year`],
      ['System size',                `${results.totalSystemKwp} kWp`],
      ['Number of panels',           `${results.totalPanelCount} × 450W panels`],
      ['Annual generation',          `${formatNumber(results.annualGenerationKwh)} kWh`],
      ['Self-consumed (75%)',        `${formatNumber(results.selfConsumedKwh)} kWh/yr`],
      ['Exported (25%)',             `${formatNumber(results.exportedKwh)} kWh/yr`],
      ['CO₂ saved per year',         `${formatNumber(results.annualCo2KgSaved)} kg`],
      ['Trees equivalent per year',  `${results.treesEquivalent} trees`]
    ],
    headStyles: { fillColor: BRAND_AMBER, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 1: { halign: 'right' } }
  })

  // ── Monthly bar chart ─────────────────────────────────────────────────────
  const monthlyData = siteData.monthlyData ?? []
  if (monthlyData.length) {
    y = doc.lastAutoTable.finalY + 8
    if (y + 50 > pageH - 25) { doc.addPage(); y = 20 }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRAND_DARK)
    doc.text('Monthly Generation Profile (kWh/kWp · PVGIS)', M, y)

    y += 4
    const chartW   = pageW - M * 2
    const chartH   = 30
    const barW     = chartW / 12 - 1
    const maxYield = Math.max(...monthlyData.map(m => m.yieldKwh), 1)

    monthlyData.forEach((m, i) => {
      const x      = M + i * (chartW / 12)
      const barH   = Math.max(1, (m.yieldKwh / maxYield) * chartH)
      const barTop = y + chartH - barH

      doc.setFillColor(...BRAND_AMBER)
      doc.rect(x + 0.5, barTop, barW, barH, 'F')

      doc.setFontSize(6)
      doc.setTextColor(...BRAND_GRAY)
      doc.text(m.monthName ?? `M${m.month}`, x + barW / 2 + 0.5, y + chartH + 4, { align: 'center' })
      if (m.yieldKwh > 0) {
        doc.text(`${m.yieldKwh}`, x + barW / 2 + 0.5, barTop - 1, { align: 'center' })
      }
    })

    y += chartH + 10
    doc.setFontSize(7)
    doc.text('Source: PVGIS (European Commission)', M, y)
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    const footerY = pageH - 14
    doc.setFillColor(...BRAND_DARK)
    doc.rect(0, footerY, pageW, 14, 'F')
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'All figures are indicative estimates for guidance only. PVGIS irradiance © European Commission. 30-yr lifespan, 0.5%/yr degradation, 3%/yr grid escalation, 75% self-consumption, SEG at 5p/kWh. Obtain a professional site survey before purchasing.',
      M, footerY + 5.5,
      { maxWidth: pageW - M * 2 - 40 }
    )
    doc.text('UK Solar Calculator Pro', pageW - M, footerY + 5.5, { align: 'right' })
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const slug     = userDetails.company.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const dateSlug = new Date().toISOString().slice(0, 10)
  doc.save(`solar-estimate-${slug}-${dateSlug}.pdf`)
}
