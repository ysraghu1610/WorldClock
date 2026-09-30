import { useEffect, useMemo, useState } from "react";
import { CitySearch } from "./components/CitySearch";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { WorldClockGrid } from "./components/WorldClockGrid";
import { availableLocations, defaultLocations } from "./data/locations";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { ClockLocation } from "./types";

const addedStorageKey = "world-clock-added-locations";
const favoriteStorageKey = "world-clock-favorites";

function App() {
  const [now, setNow] = useState(() => new Date());
  const [addedIds, setAddedIds] = useLocalStorage<string[]>(
    addedStorageKey,
    [],
  );
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>(
    favoriteStorageKey,
    [],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const addedLocations = useMemo(
    () =>
      addedIds
        .map((id) => availableLocations.find((location) => location.id === id))
        .filter((location): location is ClockLocation => Boolean(location)),
    [addedIds],
  );

  const locations = useMemo(() => {
    const orderedLocations = [...addedLocations, ...defaultLocations];

    return orderedLocations.filter(
      (location, index) =>
        orderedLocations.findIndex(
          (candidate) => candidate.id === location.id,
        ) === index,
    );
  }, [addedLocations]);
  const selectedIds = useMemo(
    () => locations.map((location) => location.id),
    [locations],
  );
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneCount = new Set(locations.map((location) => location.timeZone))
    .size;

  const addLocation = (location: ClockLocation) => {
    setAddedIds((currentIds) => [
      location.id,
      ...currentIds.filter((id) => id !== location.id),
    ]);
  };

  const removeLocation = (id: string) => {
    setAddedIds((currentIds) =>
      currentIds.filter((locationId) => locationId !== id),
    );
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((locationId) => locationId !== id)
        : [...currentIds, id],
    );
  };

  const sortedLocations = useMemo(() => {
    return [...locations].sort((first, second) => {
      const firstFavorite = favoriteIds.includes(first.id);
      const secondFavorite = favoriteIds.includes(second.id);
      if (firstFavorite === secondFavorite) return 0;
      return firstFavorite ? -1 : 1;
    });
  }, [favoriteIds, locations]);

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <Header
        now={now}
        locationCount={locations.length}
        timeZoneCount={timeZoneCount}
      />
      <CitySearch selectedIds={selectedIds} onAddLocation={addLocation} />
      <WorldClockGrid
        locations={sortedLocations}
        now={now}
        favoriteIds={favoriteIds}
        localTimeZone={localTimeZone}
        onToggleFavorite={toggleFavorite}
        onRemoveLocation={removeLocation}
      />
      <Footer />
    </div>
  );
}

export default App;
