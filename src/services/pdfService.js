/**
 * PDF Report Generator
 * Uses jsPDF to produce a branded solar calculator report.
 */

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { formatGbp, formatNumber } from './calculatorService'

const BRAND_AMBER = [245, 158, 11]    // solar-500
const BRAND_DARK  = [17, 24, 39]      // gray-900
const BRAND_GREEN = [22, 163, 74]     // green-600

export async function generatePDF({ results, mapData, userDetails }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_AMBER)
  doc.rect(0, 0, pageW, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('UK Solar Calculator Pro', margin, 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Personalised Solar Estimate Report', margin, 21)

  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(dateStr, pageW - margin, 21, { align: 'right' })

  // ── Prepared for ────────────────────────────────────────────────────────
  let y = 42
  doc.setTextColor(...BRAND_DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Prepared for', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 6
  doc.text(`${userDetails.name}  |  ${userDetails.company}`, margin, y)
  y += 5
  doc.text(`${userDetails.jobTitle}  |  ${userDetails.email}  |  ${userDetails.telephone}`, margin, y)

  // ── Key metrics boxes ────────────────────────────────────────────────────
  y += 12
  const boxW = (pageW - margin * 2 - 9) / 4
  const metrics = [
    { label: 'Panels', value: `${results.panelCount}`, sub: `${results.systemKwp} kWp` },
    { label: 'Generation', value: `${formatNumber(results.annualGenerationKwh)}`, sub: 'kWh/year' },
    { label: 'Annual Benefit', value: formatGbp(results.totalAnnualBenefit), sub: 'Savings + SEG' },
    { label: 'Payback', value: `${results.paybackYears} yrs`, sub: 'Estimated' }
  ]

  metrics.forEach((m, i) => {
    const x = margin + i * (boxW + 3)
    doc.setFillColor(255, 251, 235) // solar-50
    doc.roundedRect(x, y, boxW, 22, 2, 2, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRAND_AMBER)
    doc.text(m.value, x + boxW / 2, y + 10, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(m.label, x + boxW / 2, y + 16, { align: 'center' })
    doc.text(m.sub, x + boxW / 2, y + 20, { align: 'center' })
  })

  // ── Financial breakdown table ────────────────────────────────────────────
  y += 30
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_DARK)
  doc.text('Financial Breakdown', margin, y)

  y += 4
  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Description', 'Value']],
    body: [
      ['Estimated install cost', formatGbp(results.installCostGbp)],
      ['Annual savings (self-consumption)', `+${formatGbp(results.savingsFromSelfConsumption)}`],
      ['Annual export income (Smart Export Guarantee)', `+${formatGbp(results.exportIncome)}`],
      ['Estimated electricity bill reduction', `~${results.billReductionPct}%`],
      ['Total annual benefit', formatGbp(results.totalAnnualBenefit)],
      ['25-year total benefit (estimated)', formatGbp(results.twentyFiveYearBenefit)]
    ],
    headStyles: { fillColor: BRAND_AMBER, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
  })

  // ── System details table ─────────────────────────────────────────────────
  y = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_DARK)
  doc.text('System Details', margin, y)

  y += 4
  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Parameter', 'Value']],
    body: [
      ['Total roof area drawn', `${Math.round(mapData.roofAreaM2)} m²`],
      ['Usable roof area (70% of drawn)', `${results.usableAreaM2} m²`],
      ['Roof orientation', mapData.compassDirection || '—'],
      ['Solar irradiance (PVGIS)', `${mapData.irradianceKwhM2y} kWh/m²/year`],
      ['System size', `${results.systemKwp} kWp`],
      ['Number of panels', `${results.panelCount} × 400W panels`],
      ['CO₂ saved per year', `${formatNumber(results.annualCo2KgSaved)} kg`],
      ['Trees equivalent per year', `${results.treesEquivalent} trees`]
    ],
    headStyles: { fillColor: BRAND_AMBER, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } }
  })

  // ── Footer ───────────────────────────────────────────────────────────────
  y = pageH - 20
  doc.setFillColor(17, 24, 39)
  doc.rect(0, y, pageW, 20, 'F')
  doc.setTextColor(156, 163, 175)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'This report is for guidance only. Solar irradiance data from PVGIS (European Commission). Financial figures based on Ofgem cap rates and SEG averages. Always obtain a professional survey.',
    margin, y + 8,
    { maxWidth: pageW - margin * 2 }
  )

  // Save
  const filename = `solar-estimate-${userDetails.company.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
