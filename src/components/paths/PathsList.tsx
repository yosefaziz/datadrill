import { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTrackStore } from '@/stores/trackStore';
import { SkillType, SkillTrackMeta } from '@/types';
import { PathTrackCard } from './PathTrackCard';

interface PathsListProps {
  skill: SkillType;
}

interface CategoryRowProps {
  category: string;
  tracks: SkillTrackMeta[];
  index: number;
}

function CategoryRow({ category, tracks, index }: CategoryRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={`animate-fade-in stagger-${Math.min(index + 1, 6)}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          {category}
        </h3>

        {/* Nav arrows — only if scrollable */}
        {(canScrollPrev || canScrollNext) && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-default"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-default"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel with edge fades */}
      <div className="relative">
        {canScrollPrev && (
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
        )}
        {canScrollNext && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
        )}

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex-none w-[260px]"
              >
                <PathTrackCard track={track} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PathsList({ skill }: PathsListProps) {
  const { fetchTracksForSkill, getTracksGroupedByCategory, isLoading } = useTrackStore();
  const grouped = getTracksGroupedByCategory(skill);
  const categories = Object.keys(grouped);

  useEffect(() => {
    fetchTracksForSkill(skill);
  }, [skill, fetchTracksForSkill]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            <div className="h-4 w-32 bg-white/10 rounded mb-3" />
            <div className="flex gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex-none w-[260px] h-44 bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        No solution playbooks available yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category, index) => (
        <CategoryRow
          key={category}
          category={category}
          tracks={grouped[category]}
          index={index}
        />
      ))}
    </div>
  );
}
