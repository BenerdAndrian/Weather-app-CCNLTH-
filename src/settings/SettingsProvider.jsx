import { useEffect, useState } from 'react';
import { loadSettings, SettingsContext, STORAGE_KEY } from './settings';

export function SettingsProvider({ children }) {
  // Lazy initializer: localStorage is read once, not on every render.
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((previous) => (previous[key] === value ? previous : { ...previous, [key]: value }));
  };

  return <SettingsContext.Provider value={{ settings, updateSetting }}>{children}</SettingsContext.Provider>;
}
