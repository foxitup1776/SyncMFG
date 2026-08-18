import { describe, expect, it } from 'vitest'
import {
  chiSquareContingency,
  chiSquarePValue,
  oneProportionTest,
  twoProportionTest,
} from './proportions'

describe('oneProportionTest', () => {
  it('20/100 vs p0=0.10 → z = 10/3, p from Φ', () => {
    const r = oneProportionTest(20, 100, 0.1)
    expect(r).not.toBeNull()
    expect(r!.pHat).toBeCloseTo(0.2, 12)
    expect(r!.z).toBeCloseTo(10 / 3, 10)
    // SciPy: 2 * scipy.stats.norm.sf(10/3)
    expect(r!.pValue).toBeCloseTo(0.000858577770047, 6)
  })
})

describe('twoProportionTest', () => {
  it('30/100 vs 10/100 pooled z-test', () => {
    const r = twoProportionTest(30, 100, 10, 100)
    expect(r).not.toBeNull()
    expect(r!.p1).toBeCloseTo(0.3, 12)
    expect(r!.p2).toBeCloseTo(0.1, 12)
    expect(r!.pPooled).toBeCloseTo(0.2, 12)
    // z = 5/√2, so 2(1 − Φ(z)) = erfc(2.5)
    expect(r!.z).toBeCloseTo(5 / Math.SQRT2, 12)
    expect(r!.pValue).toBeCloseTo(0.000406952017445, 12)
  })
})

describe('chiSquareContingency', () => {
  it('2×2 table [[10,20],[20,10]] → χ² = 20/3, df = 1', () => {
    const r = chiSquareContingency(
      ['A', 'B'],
      ['X', 'Y'],
      [
        [10, 20],
        [20, 10],
      ],
    )
    expect(r).not.toBeNull()
    expect(r!.chiSq).toBeCloseTo(20 / 3, 10)
    expect(r!.df).toBe(1)
    expect(r!.expected[0][0]).toBeCloseTo(15, 12)
    // SciPy: scipy.stats.chi2.sf(20/3, 1)
    expect(r!.pValue).toBeCloseTo(0.009823274507497, 6)
  })
})

describe('chiSquarePValue', () => {
  it('χ²(1) = 3.841 matches the 5% table', () => {
    expect(chiSquarePValue(3.841458820694125, 1)).toBeCloseTo(0.05, 4)
  })
})
