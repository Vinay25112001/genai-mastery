import React from 'react';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'local';

interface Props { status: SyncStatus; }

const CONFIG = {
  synced:  { icon: '☁️', label: 'Synced',        cls: 'synced' },
  syncing: { icon: '⏳', label: 'Syncing...',     cls: 'syncing' },
  offline: { icon: '📡', label: 'Offline — saved locally', cls: 'offline' },
  error:   { icon: '⚠️', label: 'Sync failed — saved locally', cls: 'error' },
  local:   { icon: '💾', label: 'Saved locally', cls: '' },
};

const SyncIndicator: React.FC<Props> = ({ status }) => {
  const c = CONFIG[status];
  return (
    <div className={`sync-indicator ${c.cls}`} aria-label={c.label} role="status">
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </div>
  );
};

export default SyncIndicator;
