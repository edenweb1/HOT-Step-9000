import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  title,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center justify-between gap-2 py-1.5 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      title={title}
    >
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 border ${
          checked
            ? 'bg-pink-600 border-pink-600'
            : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
};
