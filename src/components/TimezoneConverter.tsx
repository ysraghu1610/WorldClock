import { useEffect, useMemo, useState } from 'react';
import { availableLocations } from '../data/locations';
import type { ClockLocation } from '../types';
import { getInputDateTimeForTimeZone, getTimeParts, zonedDateTimeToDate } from '../utils/time';

type TimezoneConverterProps = {
  locations: ClockLocation[];
  now: Date;
};

export function TimezoneConverter({ locations, now }: TimezoneConverterProps) {
  const [sourceId, setSourceId] = useState(locations[0]?.id ?? availableLocations[0].id);
  const [input, setInput] = useState(() => getInputDateTimeForTimeZone(now, locations[0]?.timeZone ?? 'UTC'));

  const sourceLocation =
    availableLocations.find((location) => location.id === sourceId) ?? locations[0] ?? availableLocations[0];

  useEffect(() => {
    if (!availableLocations.some((location) => location.id === sourceId)) {
      setSourceId(locations[0]?.id ?? availableLocations[0].id);
    }
  }, [locations, sourceId]);

  const conversionDate = useMemo(
    () => zonedDateTimeToDate(input.dateValue, input.timeValue, sourceLocation.timeZone),
    [input.dateValue, input.timeValue, sourceLocation.timeZone],
  );

  const resultLocations = useMemo(() => {
    const orderedLocations = [sourceLocation, ...locations];
    return orderedLocations.filter(
      (location, index) => orderedLocations.findIndex((candidate) => candidate.id === location.id) === index,
    );
  }, [locations, sourceLocation]);

  const changeSource = (nextSourceId: string) => {
    const nextSource = availableLocations.find((location) => location.id === nextSourceId);
    if (!nextSource) return;

    setSourceId(nextSourceId);
    setInput(getInputDateTimeForTimeZone(now, nextSource.timeZone));
  };

  return (
    <section className="converter" aria-labelledby="converter-title">
      <div className="converter__heading">
        <div>
          <p className="converter__eyebrow">TIMEZONE CONVERTER</p>
          <h2 id="converter-title">One moment, everywhere.</h2>
        </div>
        <p>Choose a local date and time to compare it across your clocks.</p>
      </div>

      <div className="converter__controls">
        <label>
          <span>Starting city</span>
          <select value={sourceLocation.id} onChange={(event) => changeSource(event.target.value)}>
            {availableLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.flag} {location.city}, {location.country}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Date</span>
          <input
            type="date"
            value={input.dateValue}
            onChange={(event) => setInput((current) => ({ ...current, dateValue: event.target.value }))}
          />
        </label>
        <label>
          <span>Time</span>
          <input
            type="time"
            value={input.timeValue}
            onChange={(event) => setInput((current) => ({ ...current, timeValue: event.target.value }))}
          />
        </label>
      </div>

      {conversionDate ? (
        <div className="converter__results" aria-live="polite">
          {resultLocations.map((location) => {
            const parts = getTimeParts(conversionDate, location.timeZone);
            const isSource = location.id === sourceLocation.id;

            return (
              <div className={`converter__result ${isSource ? 'converter__result--source' : ''}`} key={location.id}>
                <span className="converter__flag">{location.flag}</span>
                <span className="converter__place">
                  <strong>{location.city}</strong>
                  <small>{location.country}</small>
                </span>
                <span className="converter__time">
                  <strong>{parts.shortTimeLabel}</strong>
                  <small>{parts.weekday}, {parts.month} {parts.day} · {parts.offsetLabel}</small>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="converter__notice" role="status">
          That local time does not occur in this city because of a daylight-saving change. Pick another time.
        </p>
      )}
    </section>
  );
}
