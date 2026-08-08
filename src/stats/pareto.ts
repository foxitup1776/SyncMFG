export interface ParetoItem {
  label: string
  count: number
  pct: number
  cumPct: number
}

export function buildPareto(
  labels: string[],
  counts?: number[],
): ParetoItem[] {
  const map = new Map<string, number>()
  if (counts && counts.length === labels.length) {
    labels.forEach((label, i) => {
      const key = String(label)
      map.set(key, (map.get(key) ?? 0) + (counts[i] || 0))
    })
  } else {
    for (const label of labels) {
      const key = String(label)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
  }

  const items = [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  const total = items.reduce((s, i) => s + i.count, 0) || 1
  let cum = 0
  return items.map((item) => {
    cum += item.count
    return {
      ...item,
      pct: (item.count / total) * 100,
      cumPct: (cum / total) * 100,
    }
  })
}
