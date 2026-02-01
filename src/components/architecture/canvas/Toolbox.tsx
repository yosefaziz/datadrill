import { useMemo } from 'react';
import { ToolboxComponent, getComponentsByIds } from '@/data/toolbox';
import { DraggableComponent } from './DraggableComponent';

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface ToolboxProps {
  availableComponentIds: string[];
  usedComponentIds: string[];
  disabled?: boolean;
}

export function Toolbox({
  availableComponentIds,
  usedComponentIds,
  disabled = false,
}: ToolboxProps) {
  // Group by category and shuffle within each category (only when availableComponentIds changes)
  const grouped = useMemo(() => {
    const components = getComponentsByIds(availableComponentIds);
    const groups = components.reduce(
      (acc, component) => {
        if (!acc[component.category]) {
          acc[component.category] = [];
        }
        acc[component.category].push(component);
        return acc;
      },
      {} as Record<string, ToolboxComponent[]>
    );

    // Shuffle components within each category
    for (const category of Object.keys(groups)) {
      groups[category] = shuffle(groups[category]);
    }

    return groups;
  }, [availableComponentIds]);

  const categoryLabels: Record<string, string> = {
    ingestion: 'Ingestion',
    processing: 'Processing',
    storage: 'Storage',
    serving: 'Serving',
  };

  const categoryColors: Record<string, string> = {
    ingestion: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    storage: 'bg-amber-100 text-amber-700',
    serving: 'bg-green-100 text-green-700',
  };

  const categoryOrder = ['ingestion', 'processing', 'storage', 'serving'];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
        Component Library
        <span className="ml-2 text-xs font-normal text-slate-400">Drag to add</span>
      </h3>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-4">
          {categoryOrder.map((category) => {
            const categoryComponents = grouped[category];
            if (!categoryComponents?.length) return null;

            return (
              <div key={category} className="flex-1 min-w-[200px]">
                <h4
                  className={`text-xs font-medium px-2 py-1 rounded mb-2 ${categoryColors[category]}`}
                >
                  {categoryLabels[category]}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {categoryComponents.map((component) => {
                    const isUsed = usedComponentIds.includes(component.id);
                    return (
                      <DraggableComponent
                        key={component.id}
                        component={component}
                        disabled={disabled || isUsed}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
