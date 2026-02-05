import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { SkillType } from '@/types';
import { useState, useRef, useEffect } from 'react';

interface SkillCardProps {
  skill: SkillType;
  name: string;
  Icon: LucideIcon;
  description: string;
  questionCount: number;
  className?: string;
  // Props for the multi-card glow effect
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isAnyCardHovered?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
}

export function SkillCard({
  skill,
  name,
  Icon,
  description,
  questionCount,
  className = '',
  containerRef,
  isAnyCardHovered = false,
  onHoverChange,
}: SkillCardProps) {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const [outerMousePos, setOuterMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Track mouse position relative to this card for the inner glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setLocalMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Update outer glow position based on container mouse position
  useEffect(() => {
    if (!containerRef?.current || !cardRef.current) return;

    const handleContainerMouseMove = (e: MouseEvent) => {
      const cardRect = cardRef.current?.getBoundingClientRect();
      if (!cardRect) return;

      setOuterMousePos({
        x: e.clientX - cardRect.left,
        y: e.clientY - cardRect.top,
      });
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleContainerMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleContainerMouseMove);
    };
  }, [containerRef]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHoverChange?.(false);
  };

  return (
    <div
      ref={cardRef}
      className={`relative h-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer card wrapper - creates the "border" via the lighter background showing through */}
      <div className="relative h-full rounded-xl overflow-hidden bg-white/[0.15] shadow-lg shadow-black/20">
        {/* Outer glow - visible through the 1px gap, shows on ALL cards when any is hovered */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${isAnyCardHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: `radial-gradient(circle 180px at ${outerMousePos.x}px ${outerMousePos.y}px, var(--card-glow), transparent)`,
          }}
        />

        {/* Inner card - inset by 1px to reveal the "border" */}
        <div className="relative h-[calc(100%-2px)] m-[1px] rounded-[calc(0.75rem-1px)] bg-surface overflow-hidden">
          {/* Inner glow - faint, only shows on the currently hovered card */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${isHovering ? 'opacity-40' : 'opacity-0'}`}
            style={{
              background: `radial-gradient(circle 150px at ${localMousePos.x}px ${localMousePos.y}px, var(--card-glow), transparent)`,
            }}
          />

          <Link
            to={`/${skill}`}
            className="skill-card group flex flex-col h-full p-6 transition-all duration-300 hover:-translate-y-1 relative"
          >
            <div className="text-center flex flex-col h-full">
              <div className="flex justify-center mb-3">
                <Icon
                  className="w-10 h-10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:icon-glow"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{name}</h3>
              <p className="text-text-secondary text-sm mb-4 flex-1">{description}</p>
              <div className="text-sm text-text-muted">
                {questionCount} {questionCount === 1 ? 'question' : 'questions'}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
