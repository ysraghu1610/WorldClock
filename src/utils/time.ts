import type { ContactStatus, TimeParts } from '../types';

const timeFormatterCache = new Map<string, Intl.DateTimeFormat>();
const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();
const offsetFormatterCache = new Map<string, Intl.DateTimeFormat>();
const conversionFormatterCache = new Map<string, Intl.DateTimeFormat>();
const timeZoneAliases: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
};

const getTimeFormatter = (timeZone: string, withSeconds: boolean) => {
  const key = `${timeZone}-${withSeconds ? 'seconds' : 'minutes'}`;
  const cached = timeFormatterCache.get(key);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: true,
  });
  timeFormatterCache.set(key, formatter);
  return formatter;
};

const getPartsFormatter = (timeZone: string) => {
  const cached = partsFormatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  partsFormatterCache.set(timeZone, formatter);
  return formatter;
};

const getDateFormatter = (timeZone: string) => {
  const cached = dateFormatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  dateFormatterCache.set(timeZone, formatter);
  return formatter;
};

const getOffsetFormatter = (timeZone: string) => {
  const cached = offsetFormatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  });
  offsetFormatterCache.set(timeZone, formatter);
  return formatter;
};

const getConversionFormatter = (timeZone: string) => {
  const cached = conversionFormatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  conversionFormatterCache.set(timeZone, formatter);
  return formatter;
};

const partValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((part) => part.type === type)?.value ?? '';

const formatOffsetLabel = (offsetPart?: string) => {
  if (!offsetPart || offsetPart === 'GMT') return 'UTC +0';

  const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return offsetPart.replace('GMT', 'UTC');

  const sign = match[1];
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? '0');
  return `UTC ${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
};

export const getTimeParts = (date: Date, timeZone: string): TimeParts => {
  const parts = getPartsFormatter(timeZone).formatToParts(date);
  const rawHour = Number(partValue(parts, 'hour'));
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = Number(partValue(parts, 'minute'));
  const second = Number(partValue(parts, 'second'));
  const offsetPart = getOffsetFormatter(timeZone)
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  return {
    hour,
    minute,
    second,
    weekday: partValue(parts, 'weekday'),
    month: partValue(parts, 'month'),
    day: partValue(parts, 'day'),
    dateLabel: getDateFormatter(timeZone).format(date),
    timeLabel: getTimeFormatter(timeZone, true).format(date),
    shortTimeLabel: getTimeFormatter(timeZone, false).format(date),
    offsetLabel: formatOffsetLabel(offsetPart),
  };
};

export const getHeaderDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

export const isDaytime = (hour: number) => hour >= 6 && hour < 18;

export const getContactStatus = (hour: number): ContactStatus => {
  if (hour >= 9 && hour < 18) {
    return { label: 'Good time to contact', tone: 'good' };
  }

  if (hour >= 18 && hour < 22) {
    return { label: 'Maybe', tone: 'maybe' };
  }

  return { label: 'Sleeping hours', tone: 'sleeping' };
};

export const getTimeZoneMinuteOffset = (date: Date, timeZone: string) => {
  const offsetPart = getOffsetFormatter(timeZone)
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  if (!offsetPart || offsetPart === 'GMT') return 0;

  const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? '0');
  return sign * (hours * 60 + minutes);
};

export const getDifferenceFromBase = (date: Date, timeZone: string, baseTimeZone: string) => {
  const diffMinutes =
    getTimeZoneMinuteOffset(date, timeZone) - getTimeZoneMinuteOffset(date, baseTimeZone);

  if (diffMinutes === 0) return 'Your base time';

  const absMinutes = Math.abs(diffMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  const hourText = hours > 0 ? `${hours}h` : '';
  const minuteText = minutes > 0 ? `${minutes}m` : '';
  const direction = diffMinutes > 0 ? 'ahead of GMT' : 'behind GMT';

  return `${[hourText, minuteText].filter(Boolean).join(' ')} ${direction}`;
};

const getInputPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  Number(partValue(parts, type));

export const getInputDateTimeForTimeZone = (date: Date, timeZone: string) => {
  const parts = getConversionFormatter(timeZone).formatToParts(date);
  const year = getInputPart(parts, 'year');
  const month = getInputPart(parts, 'month');
  const day = getInputPart(parts, 'day');
  const hour = getInputPart(parts, 'hour');
  const minute = getInputPart(parts, 'minute');

  return {
    dateValue: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    timeValue: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
};

export const zonedDateTimeToDate = (dateValue: string, timeValue: string, timeZone: string) => {
  const match = `${dateValue}T${timeValue}`.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const targetTimestamp = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = new Date(targetTimestamp);

  // Resolve a wall-clock value in the chosen IANA zone to one exact instant.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getConversionFormatter(timeZone).formatToParts(candidate);
    const observedTimestamp = Date.UTC(
      getInputPart(parts, 'year'),
      getInputPart(parts, 'month') - 1,
      getInputPart(parts, 'day'),
      getInputPart(parts, 'hour'),
      getInputPart(parts, 'minute'),
    );
    const adjustment = targetTimestamp - observedTimestamp;
    if (adjustment === 0) break;
    candidate = new Date(candidate.getTime() + adjustment);
  }

  const resolved = getInputDateTimeForTimeZone(candidate, timeZone);
  return resolved.dateValue === dateValue && resolved.timeValue === timeValue ? candidate : null;
};

export const normalizeTimeZone = (timeZone: string) => timeZoneAliases[timeZone] ?? timeZone;

export const isMatchingTimeZone = (firstTimeZone: string, secondTimeZone: string) =>
  normalizeTimeZone(firstTimeZone) === normalizeTimeZone(secondTimeZone);
