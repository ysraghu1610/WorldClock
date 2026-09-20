export type ClockLocation = {
  id: string;
  country: string;
  city: string;
  flag: string;
  timeZone: string;
  isDefault?: boolean;
};

export type ContactStatus = {
  label: string;
  tone: 'good' | 'maybe' | 'sleeping';
};

export type TimeParts = {
  hour: number;
  minute: number;
  second: number;
  weekday: string;
  month: string;
  day: string;
  dateLabel: string;
  timeLabel: string;
  shortTimeLabel: string;
  offsetLabel: string;
};
