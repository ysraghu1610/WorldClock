type AnalogClockProps = {
  hour: number;
  minute: number;
  second: number;
  isDay: boolean;
};

export function AnalogClock({ hour, minute, second, isDay }: AnalogClockProps) {
  const secondRotation = second * 6;
  const minuteRotation = (minute + second / 60) * 6;
  const hourRotation = ((hour % 12) + minute / 60) * 30;

  return (
    <div className={`analog-clock ${isDay ? 'analog-clock--day' : 'analog-clock--night'}`} aria-hidden="true">
      <span className="clock-mark clock-mark--12" />
      <span className="clock-mark clock-mark--3" />
      <span className="clock-mark clock-mark--6" />
      <span className="clock-mark clock-mark--9" />
      <span className="hand hand--hour" style={{ transform: `rotate(${hourRotation}deg)` }} />
      <span className="hand hand--minute" style={{ transform: `rotate(${minuteRotation}deg)` }} />
      <span className="hand hand--second" style={{ transform: `rotate(${secondRotation}deg)` }} />
      <span className="clock-pin" />
    </div>
  );
}
