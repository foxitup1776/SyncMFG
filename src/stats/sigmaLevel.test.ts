import { describe, expect, it } from 'vitest'
import { calcRty, calcSigmaLevel } from './sigmaLevel'

describe('calcSigmaLevel', () => {
  it('DPMO, DPU, and yield are the raw count identities', () => {
    const r = calcSigmaLevel({
      units: 1000,
      defects: 20,
      opportunitiesPerUnit: 5,
      applyShift: false,
    })
    expect(r).not.toBeNull()
    expect(r!.totalOpportunities).toBe(5000)
    expect(r!.dpu).toBeCloseTo(0.02, 12)
    expect(r!.dpo).toBeCloseTo(0.004, 12)
    expect(r!.dpmo).toBeCloseTo(4000, 8)
    expect(r!.yieldPct).toBeCloseTo(99.6, 8)
  })

  it('3.4 DPMO with the 1.5σ shift reports ~6 sigma (the published table row)', () => {
    const r = calcSigmaLevel({
      units: 1_000_000,
      defects: 3.4,
      opportunitiesPerUnit: 1,
      applyShift: true,
    })
    expect(r).not.toBeNull()
    expect(r!.dpmo).toBeCloseTo(3.4, 8)
    expect(r!.sigmaLevel).toBeCloseTo(6, 2)
    expect(r!.band).toBe('world-class')
  })

  it('without the shift, 3.4 DPMO is ~4.5 long-term sigma', () => {
    const r = calcSigmaLevel({
      units: 1_000_000,
      defects: 3.4,
      opportunitiesPerUnit: 1,
      applyShift: false,
    })
    expect(r).not.toBeNull()
    expect(r!.sigmaLevel).toBeCloseTo(4.5, 2)
  })
})

describe('calcRty', () => {
  it('multiplies first-pass yields (95% × 90% × 95%)', () => {
    const r = calcRty([
      { label: 'Cut', units: 100, defects: 5 },
      { label: 'Weld', units: 100, defects: 10 },
      { label: 'Paint', units: 100, defects: 5 },
    ])
    expect(r).not.toBeNull()
    expect(r!.rtyPct).toBeCloseTo(0.95 * 0.9 * 0.95 * 100, 10)
    expect(r!.weakest?.label).toBe('Weld')
  })
})
