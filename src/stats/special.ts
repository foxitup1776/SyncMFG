/**
 * Shared special functions for the in-browser stats engines.
 *
 * One Lanczos log-gamma, one incomplete beta, one incomplete gamma.
 * t, F, χ², and Φ all go through here so a fixture failure has one place to fix.
 */

/** log Γ(z) for z > 0. Recurs below 1 so half-integers (t, χ² df=1) stay accurate. */
export function logGamma(z: number): number {
  if (!(z > 0)) return Number.NaN
  if (z < 1) return logGamma(z + 1) - Math.log(z)

  const g = 7
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843696540789804e-6, 1.5056327351493116e-7,
  ]
  z -= 1
  let x = p[0]
  for (let i = 1; i < p.length; i++) x += p[i] / (z + i)
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

/** Regularized lower incomplete gamma P(a, x) = γ(a,x)/Γ(a). */
export function regularizedLowerGamma(a: number, x: number): number {
  if (!(a > 0) || !Number.isFinite(x) || x <= 0) return 0
  if (x < a + 1) {
    let sum = 1 / a
    let term = sum
    for (let n = 1; n < 400; n++) {
      term *= x / (a + n)
      sum += term
      if (Math.abs(term) < Math.abs(sum) * 1e-16) break
    }
    return clamp01(sum * Math.exp(-x + a * Math.log(x) - logGamma(a)))
  }
  let b = x + 1 - a
  let c = 1 / 1e-30
  let d = 1 / b
  let h = d
  for (let i = 1; i < 400; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = b + an / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-15) break
  }
  const q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
  return clamp01(1 - q)
}

/** Regularized incomplete beta I_x(a, b). */
export function regularizedIncompleteBeta(
  x: number,
  a: number,
  b: number,
): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  if (!(a > 0) || !(b > 0)) return Number.NaN
  const bt = Math.exp(
    logGamma(a + b) -
      logGamma(a) -
      logGamma(b) +
      a * Math.log(x) +
      b * Math.log(1 - x),
  )
  const result =
    x < (a + 1) / (a + b + 2)
      ? (bt * betacf(x, a, b)) / a
      : 1 - (bt * betacf(1 - x, b, a)) / b
  return clamp01(result)
}

/**
 * Error function. Incomplete-gamma at a=1/2 is a poor tail; use Kummer’s
 * M(1, 3/2, x²) series (and an erfc asymptotic for |x| ≥ 5).
 */
export function erf(x: number): number {
  if (x === 0) return 0
  if (!Number.isFinite(x)) return Math.sign(x)
  const ax = Math.abs(x)
  const y = ax < 5 ? erfKummer(ax) : 1 - erfcAsymptotic(ax)
  const clamped = y > 1 ? 1 : y
  return x < 0 ? -clamped : clamped
}

function erfKummer(x: number): number {
  const z = x * x
  let term = 1
  let sum = 1
  for (let n = 0; n < 250; n++) {
    term *= z / (n + 1.5)
    sum += term
    if (Math.abs(term) < 1e-18 * Math.abs(sum)) break
  }
  return ((2 * x) / Math.sqrt(Math.PI)) * Math.exp(-z) * sum
}

function erfcAsymptotic(x: number): number {
  const z = x * x
  let term = 1
  let sum = 1
  const inv = 1 / (2 * z)
  for (let n = 1; n < 40; n++) {
    term *= -(2 * n - 1) * inv
    const next = sum + term
    if (Math.abs(term) < 1e-18) break
    // Alternating asymptotic: stop before terms grow.
    if (Math.abs(term) > Math.abs(sum * inv) && n > 2) break
    sum = next
  }
  return Math.exp(-z) / (x * Math.sqrt(Math.PI)) * sum
}

/** Student-t CDF. Two-sided p = 2 * (1 − F(|t|)). */
export function studentTCdf(t: number, df: number): number {
  if (!Number.isFinite(t) || !(df > 0)) return Number.NaN
  if (t === 0) return 0.5
  const ib = regularizedIncompleteBeta(df / (df + t * t), df / 2, 0.5)
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib
}

/** Inverse of studentTCdf. */
export function studentTQuantile(p: number, df: number): number {
  if (!(df > 0) || !Number.isFinite(p)) return Number.NaN
  if (p <= 0) return Number.NEGATIVE_INFINITY
  if (p >= 1) return Number.POSITIVE_INFINITY
  if (p === 0.5) return 0
  const lower = p < 0.5
  const target = lower ? 1 - p : p
  let lo = 0
  let hi = 1
  while (studentTCdf(hi, df) < target) {
    hi *= 2
    if (hi > 1e8) break
  }
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (studentTCdf(mid, df) < target) lo = mid
    else hi = mid
  }
  const t = (lo + hi) / 2
  return lower ? -t : t
}

/**
 * Noncentral t CDF (Lenth, Algorithm AS 243).
 * Minitab Power and Sample Size for 2-sample / paired t is built on this.
 */
export function noncentralTCdf(t: number, df: number, ncp: number): number {
  if (!(df > 0) || !Number.isFinite(t) || !Number.isFinite(ncp)) return Number.NaN
  if (ncp === 0) return studentTCdf(t, df)
  if (!Number.isFinite(t)) return t > 0 ? 1 : 0

  const r2pi = Math.sqrt(2 / Math.PI)
  const alnrpi = 0.5 * Math.log(Math.PI)
  const errmax = 1e-12
  const itrmax = 1000

  let tt = t
  let delt = ncp
  let negdel = false
  if (t < 0) {
    negdel = true
    tt = -t
    delt = -ncp
  }

  const x = (tt * tt) / (tt * tt + df)
  let value = 0
  if (x > 0) {
    const lam = delt * delt
    let p = 0.5 * Math.exp(-0.5 * lam)
    let q = r2pi * p * delt
    let s = 0.5 - p
    let a = 0.5
    const b = 0.5 * df
    const rxb = (1 - x) ** b
    const albeta = alnrpi + logGamma(b) - logGamma(a + b)
    let xodd = regularizedIncompleteBeta(x, a, b)
    let godd = 2 * rxb * Math.exp(a * Math.log(x) - albeta)
    let xeven = 1 - rxb
    let geven = b * x * rxb
    value = p * xodd + q * xeven
    for (let en = 1; en <= itrmax; en++) {
      a += 1
      xodd -= godd
      xeven -= geven
      godd *= (x * (a + b - 1)) / a
      geven *= (x * (a + b - 0.5)) / (a + 0.5)
      p *= lam / (2 * en)
      q *= lam / (2 * en + 1)
      s -= p
      value += p * xodd + q * xeven
      const errbd = 2 * s * (xodd - godd)
      if (errbd <= errmax) break
    }
  }

  value += 0.5 * (1 - erf(delt / Math.SQRT2))
  if (negdel) value = 1 - value
  return clamp01(value)
}

export function fCdf(f: number, d1: number, d2: number): number {
  if (!(f > 0) || !(d1 > 0) || !(d2 > 0)) return 0
  return regularizedIncompleteBeta((d1 * f) / (d1 * f + d2), d1 / 2, d2 / 2)
}

export function chiSquareCdf(x: number, df: number): number {
  if (!(x > 0) || !(df > 0)) return 0
  return regularizedLowerGamma(df / 2, x / 2)
}

function betacf(x: number, a: number, b: number): number {
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < 1e-30) d = 1e-30
  d = 1 / d
  let h = d
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-15) break
  }
  return h
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}
