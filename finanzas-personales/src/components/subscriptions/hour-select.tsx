"use client";

export function hourLabel(h: number) {
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${suffix}`;
}

export function HourSelect({
  value,
  onChange,
  disabled,
  className,
}: {
  value: number;
  onChange: (hour: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="Hora del aviso"
      className={className}
    >
      {Array.from({ length: 24 }, (_, h) => (
        <option key={h} value={h}>
          {hourLabel(h)}
        </option>
      ))}
    </select>
  );
}
