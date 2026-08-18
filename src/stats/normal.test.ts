import { describe, expect, it } from 'vitest'
import { normalCdf, normalQuantile, zOneSided, zTwoSided } from './normal'

/**
 * Published N(0,1) values (standard tables / SciPy ndtr & ndtri).
 * Acklam + erf must land inside 1e-6 or the rest of the stack is lying.
 */
describe('normalCdf / normalQuantile', () => {
  it('Φ(0) = 1/2', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 10)
  })

  it('Φ(1.96) matches the two-sided 95% table', () => {
    expect(normalCdf(1.96)).toBeCloseTo(0.9750021048517796, 6)
  })

  it('Φ(−1.96) is the lower tail', () => {
    expect(normalCdf(-1.96)).toBeCloseTo(0.0249978951482204, 6)
  })

  it('inverse of 0.975 is z ≈ 1.959964', () => {
    expect(normalQuantile(0.975)).toBeCloseTo(1.959963984540054, 5)
  })

  it('zTwoSided(0.05) ≈ 1.96', () => {
    expect(zTwoSided(0.05)).toBeCloseTo(1.959963984540054, 5)
  })

  it('zOneSided(0.05) ≈ 1.645', () => {
    expect(zOneSided(0.05)).toBeCloseTo(1.6448536269514722, 5)
  })

  it('round-trips a grid of probabilities', () => {
    for (const p of [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99]) {
      expect(normalCdf(normalQuantile(p))).toBeCloseTo(p, 6)
    }
  })
})
