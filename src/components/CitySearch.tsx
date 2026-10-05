import { useMemo, useState } from 'react';
import { availableLocations } from '../data/locations';
import type { ClockLocation } from '../types';

type CitySearchProps = {
  selectedIds: string[];
  onAddLocation: (location: ClockLocation) => void;
};

export function CitySearch({ selectedIds, onAddLocation }: CitySearchProps) {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return availableLocations
      .filter((location) => {
        const searchable = `${location.city} ${location.country} ${location.timeZone}`.toLowerCase();
        return searchable.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [query, selectedIds]);

  const addLocation = (location: ClockLocation) => {
    onAddLocation(location);
    setQuery('');
  };

  return (
    <section className="search-panel" aria-label="Add a city clock">
      <div className="search-shell">
        <span className="search-icon">🔍</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search city or country..."
          aria-label="Search city or country"
        />
      </div>

      {query.trim() && (
        <div className="search-results">
          {matches.length > 0 ? (
            matches.map((location) => {
              const isAdded = selectedIds.includes(location.id);

              return (
                <button
                  key={location.id}
                  className={isAdded ? 'search-result--added' : ''}
                  type="button"
                  disabled={isAdded}
                  onClick={() => addLocation(location)}
                >
                  <span>{location.flag}</span>
                  <span>
                    <strong>{location.city}</strong>
                    <small>{location.country}</small>
                  </span>
                  {isAdded ? <em className="search-result__status">Already added</em> : <em>{location.timeZone.replace('_', ' ')}</em>}
                </button>
              );
            })
          ) : (
            <p>No available matches.</p>
          )}
        </div>
      )}
    </section>
  );
}
