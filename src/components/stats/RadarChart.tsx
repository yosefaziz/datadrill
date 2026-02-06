import { SkillStats, SkillType } from '@/types';

interface RadarChartProps {
  skills: SkillStats[];
  onSkillClick: (skill: SkillType) => void;
  selectedSkill: SkillType | null;
}

const SKILL_LABELS: Record<SkillType, string> = {
  sql: 'SQL',
  pyspark: 'PySpark',
  debug: 'Debug',
  architecture: 'Architecture',
  modeling: 'Modeling',
};

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 120;
const LEVELS = 4;

function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  // Start from top (negative y) and go clockwise
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export function RadarChart({ skills, onSkillClick, selectedSkill }: RadarChartProps) {
  const angleStep = 360 / skills.length;

  // Grid levels
  const gridPaths = Array.from({ length: LEVELS }, (_, level) => {
    const r = (RADIUS / LEVELS) * (level + 1);
    const points = skills.map((_, i) => {
      const { x, y } = polarToCartesian(i * angleStep, r);
      return `${x},${y}`;
    });
    return `M${points.join('L')}Z`;
  });

  // Data polygon
  const dataPoints = skills.map((s, i) => {
    const r = (s.mastery / 100) * RADIUS;
    return polarToCartesian(i * angleStep, Math.max(r, 2));
  });
  const dataPath = `M${dataPoints.map((p) => `${p.x},${p.y}`).join('L')}Z`;

  // Axis lines
  const axes = skills.map((_, i) => {
    const end = polarToCartesian(i * angleStep, RADIUS);
    return { x1: CENTER, y1: CENTER, x2: end.x, y2: end.y };
  });

  // Label positions (slightly beyond radius)
  const labelPositions = skills.map((s, i) => {
    const pos = polarToCartesian(i * angleStep, RADIUS + 28);
    return { ...pos, skill: s.skill, mastery: Math.round(s.mastery) };
  });

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[320px]">
        {/* Grid */}
        {gridPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="var(--border)"
            strokeWidth={0.5}
            opacity={0.6}
          />
        ))}

        {/* Axes */}
        {axes.map((axis, i) => (
          <line
            key={i}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="var(--border)"
            strokeWidth={0.5}
            opacity={0.6}
          />
        ))}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill="var(--primary)"
          fillOpacity={0.15}
          stroke="var(--primary)"
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={skills[i].skill === selectedSkill ? 5 : 4}
            fill={skills[i].skill === selectedSkill ? 'var(--accent)' : 'var(--primary)'}
            stroke="var(--surface)"
            strokeWidth={1.5}
            className="cursor-pointer"
            onClick={() => onSkillClick(skills[i].skill)}
          />
        ))}

        {/* Labels */}
        {labelPositions.map((lp) => (
          <g key={lp.skill}>
            <text
              x={lp.x}
              y={lp.y - 6}
              textAnchor="middle"
              className="text-[10px] font-medium cursor-pointer"
              fill={lp.skill === selectedSkill ? 'var(--accent)' : 'var(--text-primary)'}
              onClick={() => onSkillClick(lp.skill)}
            >
              {SKILL_LABELS[lp.skill]}
            </text>
            <text
              x={lp.x}
              y={lp.y + 8}
              textAnchor="middle"
              className="text-[9px]"
              fill="var(--text-muted)"
            >
              {lp.mastery}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
