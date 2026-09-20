import { getHeaderDate } from "../utils/time";

type HeaderProps = {
  now: Date;
  locationCount: number;
  timeZoneCount: number;
};

export function Header({ now, locationCount, timeZoneCount }: HeaderProps) {
  return (
    <header className="hero">
      <div className="hero__copy">
        <p className="eyebrow">🌍 WORLD CLOCK</p>
        <h1>Know the time. Anywhere in the world.</h1>
        <p className="hero__date">{getHeaderDate(now)}</p>
      </div>
      <div className="summary-strip" aria-label="World clock summary"></div>
    </header>
  );
}
