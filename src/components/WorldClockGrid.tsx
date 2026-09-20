import type { ClockLocation } from '../types';
import { isMatchingTimeZone } from '../utils/time';
import { ClockCard } from './ClockCard';

type WorldClockGridProps = {
  locations: ClockLocation[];
  now: Date;
  favoriteIds: string[];
  localTimeZone: string;
  onToggleFavorite: (id: string) => void;
  onRemoveLocation: (id: string) => void;
};

export function WorldClockGrid({
  locations,
  now,
  favoriteIds,
  localTimeZone,
  onToggleFavorite,
  onRemoveLocation,
}: WorldClockGridProps) {
  return (
    <main className="clock-grid" aria-live="polite">
      {locations.map((location, index) => (
        <div className="grid-item" key={location.id} style={{ animationDelay: `${index * 55}ms` }}>
          <ClockCard
            location={location}
            now={now}
            isFavorite={favoriteIds.includes(location.id)}
            isLocal={isMatchingTimeZone(localTimeZone, location.timeZone)}
            onToggleFavorite={onToggleFavorite}
            onRemove={location.isDefault ? undefined : onRemoveLocation}
          />
        </div>
      ))}
    </main>
  );
}
