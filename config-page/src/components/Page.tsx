import React, { useState } from 'react';
import { useConfig } from '../context/PebbleConfigContext';
import { ConfirmModal } from './ConfirmModal';

export const Page: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { resetToDefaults, save, settingsError } = useConfig();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleReset = () => {
    setIsConfirmOpen(true);
  };

  return (
    <div className="halite-page">
      <header className="halite-header">
        <h1>{title}</h1>
        <div className="halite-header-actions">
          <button className="halite-reset-button" onClick={handleReset}>RESET</button>
          <button
            className="halite-save-button"
            onClick={save}
            disabled={!!settingsError}
            title={settingsError ?? undefined}
          >
            SAVE
          </button>
        </div>
      </header>
      <main className="halite-content">
        {children}
      </main>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={resetToDefaults}
        title="Reset Settings"
        description="Reset all settings to their defaults? This will not affect saved custom themes."
        confirmLabel="Reset to defaults"
      />
    </div>
  );
};
