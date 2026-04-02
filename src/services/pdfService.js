/**
 * PDF Report Generator
 * Produces a branded, professional solar calculator report.
 */

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { formatGbp, formatNumber } from './calculatorService'

const BRAND_AMBER  = [245, 158, 11]
const BRAND_DARK   = [17, 24, 39]
const BRAND_GREEN  = [22, 163, 74]
const BRAND_GRAY   = [107, 114, 128]

export async function generatePDF({ results, mapData, userDetails, annualBillGbp = 1200, monthlyData = [] }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M     = 20  // margin

  // ── Header ───────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_AMBER)
  doc.rect(0, 0, pageW, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('UK Solar Calculator Pro', M, 14)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Personalised Solar Estimate Report', M, 22)

  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(dateStr, pageW - M, 22, { align: 'right' })

  // ── Prepared for ─────────────────────────────────────────────────────────
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

  // ── Key metric boxes ──────────────────────────────────────────────────────
  y += 10
  const boxW = (pageW - M * 2 - 9) / 4
  const metrics = [
    { label: 'Panels',          value: `${results.panelCount}`,                      sub: `${results.systemKwp} kWp` },
    { label: 'Generation',      value: `${formatNumber(results.annualGenerationKwh)}`, sub: 'kWh/year' },
    { label: 'Annual Benefit',  value: formatGbp(results.totalAnnualBenefit),         sub: 'Savings + SEG' },
    { label: 'Payback',         value: `${results.paybackYears} yrs`,                sub: 'Estimated' }
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

  // ── 25-year highlight ─────────────────────────────────────────────────────
  y += 28
  doc.setFillColor(240, 253, 244) // green-50
  doc.roundedRect(M, y, pageW - M * 2, 14, 2, 2, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_GREEN)
  doc.text(`30-year total benefit: ${formatGbp(results.twentyFiveYearBenefit)}`, M + 4, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...BRAND_GRAY)
  doc.text(
    `Net profit after ${formatGbp(results.installCostGbp)} install cost: ${formatGbp(results.twentyFiveYearBenefit - results.installCostGbp)}`,
    M + 4, y + 11
  )

  // ── Financial table ───────────────────────────────────────────────────────
  y += 20
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_DARK)
  doc.text('Financial Breakdown', M, y)

  y += 3
  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [['Description', 'Value']],
    body: [
      ['Estimated install cost',                             formatGbp(results.installCostGbp)],
      ['Annual savings (self-consumption at 24.5p/kWh)',    `+${formatGbp(results.savingsFromSelfConsumption)}`],
      ['Annual export income (SEG at 15p/kWh)',              `+${formatGbp(results.exportIncome)}`],
      ['Total annual benefit',                               formatGbp(results.totalAnnualBenefit)],
      [`Estimated bill reduction (from £${annualBillGbp}/yr)`, `~${results.billReductionPct}%`],
      ['Payback period',                                     `${results.paybackYears} years`],
      ['30-year total benefit',                              formatGbp(results.twentyFiveYearBenefit)]
    ],
    headStyles: { fillColor: BRAND_AMBER, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
  })

  // ── System details table ──────────────────────────────────────────────────
  y = doc.lastAutoTable.finalY + 8
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
      ['Roof area drawn',             `${Math.round(mapData.roofAreaM2)} m²`],
      ['Usable roof area (70%)',       `${results.usableAreaM2} m²`],
      ['Roof orientation',             mapData.compassDirection || '—'],
      ['Roof pitch',                   `${mapData.roofTiltDeg ?? 35}°`],
      ['Solar irradiance (PVGIS)',     `${mapData.irradianceKwhM2y} kWh/m²/year`],
      ['System size',                  `${results.systemKwp} kWp`],
      ['Number of panels',             `${results.panelCount} × 400W panels`],
      ['Annual generation',            `${formatNumber(results.annualGenerationKwh)} kWh`],
      ['CO₂ saved per year',           `${formatNumber(results.annualCo2KgSaved)} kg`],
      ['Trees equivalent per year',    `${results.treesEquivalent} trees`]
    ],
    headStyles: { fillColor: BRAND_AMBER, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 1: { halign: 'right' } }
  })

  // ── Monthly bar chart (drawn manually) ────────────────────────────────────
  if (monthlyData.length) {
    y = doc.lastAutoTable.finalY + 8

    // Check if enough space on page, else add page
    if (y + 50 > pageH - 25) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRAND_DARK)
    doc.text('Monthly Generation Profile (kWh/kWp)', M, y)

    y += 4
    const chartW   = pageW - M * 2
    const chartH   = 30
    const barW     = chartW / 12 - 1
    const maxYield = Math.max(...monthlyData.map(m => m.yieldKwh), 1)

    monthlyData.forEach((m, i) => {
      const x       = M + i * (chartW / 12)
      const barH    = Math.max(1, (m.yieldKwh / maxYield) * chartH)
      const barTop  = y + chartH - barH

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

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = pageH - 14
  doc.setFillColor(...BRAND_DARK)
  doc.rect(0, footerY, pageW, 14, 'F')
  doc.setTextColor(156, 163, 175)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'All figures are indicative estimates for guidance only. PVGIS irradiance data © European Commission. Based on 2024 commercial rates (24.5p/kWh), SEG (15p/kWh), £800/kWp install, 30-yr lifespan. Obtain a professional survey before purchasing.',
    M, footerY + 5.5,
    { maxWidth: pageW - M * 2 }
  )
  doc.text('UK Solar Calculator Pro', pageW - M, footerY + 5.5, { align: 'right' })

  // ── Save ──────────────────────────────────────────────────────────────────
  const slug     = userDetails.company.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const dateSlug = new Date().toISOString().slice(0, 10)
  doc.save(`solar-estimate-${slug}-${dateSlug}.pdf`)
}
