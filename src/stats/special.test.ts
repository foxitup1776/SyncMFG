import { describe, expect, it } from 'vitest'
import { erf, logGamma, studentTCdf } from './special'

describe('logGamma', () => {
  it('hits the identities that t and χ² actually call', () => {
    expect(logGamma(1)).toBeCloseTo(0, 12)
    expect(logGamma(4)).toBeCloseTo(Math.log(6), 12)
    // Γ(1/2) = √π — Lanczos must not evaluate at a negative shift here.
    expect(logGamma(0.5)).toBeCloseTo(0.5 * Math.log(Math.PI), 12)
  })
})

describe('studentTCdf', () => {
  it('is 1/2 at t = 0', () => {
    expect(studentTCdf(0, 8)).toBeCloseTo(0.5, 12)
  })
})

describe('erf', () => {
  it('matches published values', () => {
    expect(erf(0)).toBe(0)
    expect(erf(1)).toBeCloseTo(0.8427007929497149, 12)
    expect(erf(2.5)).toBeCloseTo(0.999593047982555, 12)
    expect(1 - erf(2.5)).toBeCloseTo(0.000406952017445, 12)
  })
})
