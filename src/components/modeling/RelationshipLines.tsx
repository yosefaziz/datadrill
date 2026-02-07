import { useLayoutEffect, useState, useCallback } from 'react';
import { UserTable } from '@/types';

interface LineData {
  id: string;
  fieldName: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface RelationshipLinesProps {
  tables: UserTable[];
  containerRef: React.RefObject<HTMLElement | null>;
  fieldRowRefs: React.RefObject<Map<string, HTMLElement>>;
}

export function RelationshipLines({
  tables,
  containerRef,
  fieldRowRefs,
}: RelationshipLinesProps) {
  const [lines, setLines] = useState<LineData[]>([]);

  const calculateLines = useCallback(() => {
    if (!containerRef.current || !fieldRowRefs.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: LineData[] = [];

    // Find fields that appear in 2+ tables
    const fieldToTables = new Map<string, string[]>();
    for (const table of tables) {
      for (const fieldId of table.fieldIds) {
        const existing = fieldToTables.get(fieldId) || [];
        existing.push(table.id);
        fieldToTables.set(fieldId, existing);
      }
    }

    for (const [fieldId, tableIds] of fieldToTables) {
      if (tableIds.length < 2) continue;

      // Draw lines between consecutive pairs
      for (let i = 0; i < tableIds.length - 1; i++) {
        const key1 = `${tableIds[i]}:${fieldId}`;
        const key2 = `${tableIds[i + 1]}:${fieldId}`;
        const el1 = fieldRowRefs.current.get(key1);
        const el2 = fieldRowRefs.current.get(key2);

        if (!el1 || !el2) continue;

        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        newLines.push({
          id: `${fieldId}-${tableIds[i]}-${tableIds[i + 1]}`,
          fieldName: fieldId.replace(/_/g, ' '),
          x1: rect1.right - containerRect.left,
          y1: rect1.top + rect1.height / 2 - containerRect.top,
          x2: rect2.left - containerRect.left,
          y2: rect2.top + rect2.height / 2 - containerRect.top,
          color: 'var(--info)',
        });
      }
    }

    setLines(newLines);
  }, [tables, containerRef, fieldRowRefs]);

  useLayoutEffect(() => {
    calculateLines();

    // Re-calculate on resize
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      calculateLines();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [calculateLines]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      {lines.map((line) => {
        const dx = line.x2 - line.x1;
        const cp = dx * 0.4;

        return (
          <g key={line.id} className="animate-in fade-in duration-300">
            <path
              d={`M ${line.x1} ${line.y1} C ${line.x1 + cp} ${line.y1}, ${line.x2 - cp} ${line.y2}, ${line.x2} ${line.y2}`}
              fill="none"
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray="6 3"
              opacity={0.5}
            />
            {/* FK label at midpoint */}
            <text
              x={(line.x1 + line.x2) / 2}
              y={(line.y1 + line.y2) / 2 - 6}
              textAnchor="middle"
              className="fill-text-muted text-[10px]"
            >
              FK
            </text>
          </g>
        );
      })}
    </svg>
  );
}
