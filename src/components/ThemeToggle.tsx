import { useTheme, type ThemePreference } from '../theme/ThemeContext';
import { IconSun, IconMoon, IconMonitor } from './icons';

const OPTIONS: { value: ThemePreference; label: string; icon: typeof IconSun }[] = [
  { value: 'light', label: 'Light theme', icon: IconSun },
  { value: 'dark', label: 'Dark theme', icon: IconMoon },
  { value: 'system', label: 'Match system theme', icon: IconMonitor },
];

/** Segmented light/dark/system control. Preference persists in localStorage. */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className="theme-toggle-btn"
          aria-pressed={preference === value}
          title={label}
          onClick={() => setPreference(value)}
        >
          <Icon size={16} />
          <span className="visually-hidden">{label}</span>
        </button>
      ))}
    </div>
  );
}
