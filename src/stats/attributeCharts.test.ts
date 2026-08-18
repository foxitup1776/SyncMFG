import { describe, expect, it } from 'vitest'
import { chooseAttributeChart, computeAttributeChart } from './attributeCharts'

describe('chooseAttributeChart', () => {
  it('picks np / p / c / u from the two questions', () => {
    expect(
      chooseAttributeChart({
        countingDefectiveUnits: true,
        constantSampleSize: true,
      }).kind,
    ).toBe('np')
    expect(
      chooseAttributeChart({
        countingDefectiveUnits: true,
        constantSampleSize: false,
      }).kind,
    ).toBe('p')
    expect(
      chooseAttributeChart({
        countingDefectiveUnits: false,
        constantSampleSize: true,
      }).kind,
    ).toBe('c')
    expect(
      chooseAttributeChart({
        countingDefectiveUnits: false,
        constantSampleSize: false,
      }).kind,
    ).toBe('u')
  })
})

describe('computeAttributeChart limits', () => {
  it('p chart: p̄ = 0.10, n = 100 → UCL 19%, LCL 1%', () => {
    const r = computeAttributeChart('p', [
      { label: '1', count: 8, size: 100 },
      { label: '2', count: 12, size: 100 },
      { label: '3', count: 10, size: 100 },
      { label: '4', count: 9, size: 100 },
      { label: '5', count: 11, size: 100 },
    ])
    expect(r).not.toBeNull()
    expect(r!.center).toBeCloseTo(10, 10)
    expect(r!.ucl).toBeCloseTo(19, 10)
    expect(r!.lcl).toBeCloseTo(1, 10)
    expect(r!.variableLimits).toBe(false)
  })

  it('np chart: n = 50, np̄ = 5 → UCL = 5 + 3√(5·0.9)', () => {
    const r = computeAttributeChart('np', [
      { label: '1', count: 4, size: 50 },
      { label: '2', count: 6, size: 50 },
      { label: '3', count: 5, size: 50 },
      { label: '4', count: 5, size: 50 },
    ])
    expect(r).not.toBeNull()
    expect(r!.center).toBeCloseTo(5, 10)
    const pBar = 20 / 200
    const ucl = 5 + 3 * Math.sqrt(5 * (1 - pBar))
    expect(r!.ucl).toBeCloseTo(ucl, 10)
    expect(r!.lcl).toBeCloseTo(Math.max(0, 5 - 3 * Math.sqrt(5 * (1 - pBar))), 10)
  })

  it('c chart: c̄ = 5 → UCL = 5 + 3√5, LCL = 0', () => {
    const r = computeAttributeChart('c', [
      { label: '1', count: 4, size: 1 },
      { label: '2', count: 6, size: 1 },
      { label: '3', count: 5, size: 1 },
      { label: '4', count: 7, size: 1 },
      { label: '5', count: 3, size: 1 },
    ])
    expect(r).not.toBeNull()
    expect(r!.center).toBeCloseTo(5, 10)
    expect(r!.ucl).toBeCloseTo(5 + 3 * Math.sqrt(5), 10)
    expect(r!.lcl).toBe(0)
  })

  it('u chart: ū = 0.5, n = 10 → UCL = 0.5 + 3√(0.5/10)', () => {
    const r = computeAttributeChart('u', [
      { label: '1', count: 4, size: 10 },
      { label: '2', count: 6, size: 10 },
      { label: '3', count: 5, size: 10 },
    ])
    expect(r).not.toBeNull()
    expect(r!.center).toBeCloseTo(0.5, 10)
    expect(r!.ucl).toBeCloseTo(0.5 + 3 * Math.sqrt(0.05), 10)
    expect(r!.lcl).toBe(0)
  })
})
