import type { ClockLocation } from '../types';
import { getContactStatus, getDifferenceFromBase, getTimeParts, isDaytime } from '../utils/time';
import { AnalogClock } from './AnalogClock';

type ClockCardProps = {
  location: ClockLocation;
  now: Date;
  isFavorite: boolean;
  isLocal: boolean;
  onToggleFavorite: (id: string) => void;
  onRemove?: (id: string) => void;
};

const baseTimeZone = 'Asia/Kolkata';

export function ClockCard({
  location,
  now,
  isFavorite,
  isLocal,
  onToggleFavorite,
  onRemove,
}: ClockCardProps) {
  const parts = getTimeParts(now, location.timeZone);
  const isDay = isDaytime(parts.hour);
  const contactStatus = getContactStatus(parts.hour);
  const timeDifference = getDifferenceFromBase(now, location.timeZone, baseTimeZone);

  return (
    <article className={`clock-card ${isDay ? 'clock-card--day' : 'clock-card--night'} ${isLocal ? 'clock-card--local' : ''}`}>
      <div className="card-actions">
        {isLocal && <span className="local-badge">YOUR LOCAL TIME</span>}
        <button
          className={`icon-button favorite-button ${isFavorite ? 'favorite-button--active' : ''}`}
          type="button"
          aria-label={isFavorite ? `Remove ${location.city} from favorites` : `Favorite ${location.city}`}
          onClick={() => onToggleFavorite(location.id)}
        >
          {isFavorite ? '★' : '☆'}
        </button>
        {onRemove && (
          <button
            className="icon-button remove-button"
            type="button"
            aria-label={`Remove ${location.city}`}
            onClick={() => onRemove(location.id)}
          >
            ×
          </button>
        )}
      </div>

      <div className="card-topline">
        <div className="place-block">
          <span className="flag">{location.flag}</span>
          <div>
            <h2>{location.country}</h2>
            <p>{location.city}</p>
          </div>
        </div>
        <AnalogClock hour={parts.hour} minute={parts.minute} second={parts.second} isDay={isDay} />
      </div>

      <div className="time-readout">
        <time dateTime={parts.dateLabel}>{parts.timeLabel}</time>
      </div>

      <div className="date-row">
        <span>{parts.weekday}</span>
        <span>
          {parts.month} {parts.day}
        </span>
        <span>{parts.offsetLabel}</span>
      </div>

      <div className="status-row">
        <span className={`day-pill ${isDay ? 'day-pill--day' : 'day-pill--night'}`}>
          {isDay ? '☀️ Day' : '🌙 Night'}
        </span>
        <span className={`contact-pill contact-pill--${contactStatus.tone}`}>
          {contactStatus.tone === 'good' ? '🟢' : contactStatus.tone === 'maybe' ? '🟡' : '🔴'}{' '}
          {contactStatus.label}
        </span>
      </div>

      <div className="difference-row">
        <span>{location.city}</span>
        <strong>{parts.shortTimeLabel}</strong>
        <small>{location.timeZone === baseTimeZone ? 'Your base time' : timeDifference}</small>
      </div>
    </article>
  );
}
