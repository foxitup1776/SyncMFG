import type { FishboneState } from '../projects/types'

const COLORS = ['#1a3a3a', '#2f6f6a', '#3d5a80', '#6b4f3a', '#5c6b73', '#4a6741']

/** Visual Ishikawa diagram — spine, head, and angled bones with cause tags. */
export function FishboneDiagram({
  fishbone,
  focusedCategory,
  onBoneClick,
}: {
  fishbone: FishboneState
  focusedCategory?: string | null
  onBoneClick?: (category: string) => void
}) {
  const bones = fishbone.bones
  const above = bones.filter((_, i) => i % 2 === 0)
  const below = bones.filter((_, i) => i % 2 === 1)
  const effect = fishbone.effect.trim() || 'Effect / problem'
  const width = 920
  const height = 420
  const spineY = height / 2
  const headX = 780
  const tailX = 40

  function bonePositions(list: typeof bones, side: 'up' | 'down') {
    const n = Math.max(list.length, 1)
    return list.map((bone, i) => {
      const t = (i + 1) / (n + 1)
      const joinX = tailX + (headX - tailX - 40) * t
      const tipY = side === 'up' ? 36 + i * 8 : height - 36 - i * 8
      const tipX = joinX - 70
      return { bone, joinX, tipX, tipY, color: COLORS[bones.indexOf(bone) % COLORS.length] }
    })
  }

  const up = bonePositions(above, 'up')
  const down = bonePositions(below, 'down')

  return (
    <div className="fishbone-diagram panel soft" aria-label="Fishbone diagram">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" className="fish-svg">
        <defs>
          <marker
            id="arrowHead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L8,3 L0,6 Z" fill="#1a3a3a" />
          </marker>
        </defs>

        {/* Spine */}
        <line
          x1={tailX}
          y1={spineY}
          x2={headX - 8}
          y2={spineY}
          stroke="#1a3a3a"
          strokeWidth="4"
          markerEnd="url(#arrowHead)"
        />

        {/* Head */}
        <polygon
          points={`${headX - 10},${spineY - 48} ${width - 16},${spineY} ${headX - 10},${spineY + 48}`}
          fill="#2f6f6a"
          opacity="0.92"
        />
        <foreignObject x={headX - 4} y={spineY - 40} width="130" height="80">
          <div className="fish-head-label">
            <span>Effect</span>
            <strong>{effect}</strong>
          </div>
        </foreignObject>

        {[...up, ...down].map(({ bone, joinX, tipX, tipY, color }) => {
          const causes = bone.causes.filter((c) => c.trim())
          const focused = focusedCategory === bone.category
          return (
            <g
              key={bone.category}
              className="fish-bone-hit"
              onClick={() => onBoneClick?.(bone.category)}
              role={onBoneClick ? 'button' : undefined}
              tabIndex={onBoneClick ? 0 : undefined}
              onKeyDown={
                onBoneClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onBoneClick(bone.category)
                      }
                    }
                  : undefined
              }
            >
              <line
                x1={tipX}
                y1={tipY}
                x2={joinX}
                y2={spineY}
                stroke={color}
                strokeWidth={focused ? 4 : 2.5}
              />
              {/* Invisible hit area */}
              <line
                x1={tipX}
                y1={tipY}
                x2={joinX}
                y2={spineY}
                stroke="transparent"
                strokeWidth="18"
              />
              <circle cx={joinX} cy={spineY} r={focused ? 6 : 4} fill={color} />
              <text
                x={tipX}
                y={tipY + (tipY < spineY ? -8 : 18)}
                textAnchor="middle"
                className="fish-cat"
                fill={color}
                fontWeight={focused ? 800 : undefined}
              >
                {shortCat(bone.category)}
              </text>
              {causes.slice(0, 4).map((c, ci) => {
                const along = 0.25 + ci * 0.18
                const x = tipX + (joinX - tipX) * along
                const y = tipY + (spineY - tipY) * along
                const side = tipY < spineY ? -1 : 1
                return (
                  <g key={`${bone.category}-${ci}`}>
                    <line
                      x1={x}
                      y1={y}
                      x2={x + 10}
                      y2={y + side * 14}
                      stroke={color}
                      strokeWidth="1.2"
                      opacity="0.7"
                    />
                    <text
                      x={x + 14}
                      y={y + side * 18}
                      className="fish-cause"
                      fill="#243038"
                    >
                      {truncate(c, 28)}
                    </text>
                  </g>
                )
              })}
              {causes.length > 4 ? (
                <text
                  x={tipX + 20}
                  y={tipY + (tipY < spineY ? 28 : -20)}
                  className="fish-cause more"
                  fill="#5c6b73"
                >
                  +{causes.length - 4} more
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function shortCat(name: string): string {
  if (name.startsWith('Man')) return 'People'
  if (name.startsWith('Environment')) return 'Environment'
  return name.split(' ')[0] ?? name
}

function truncate(s: string, n: number): string {
  const t = s.trim()
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`
}
