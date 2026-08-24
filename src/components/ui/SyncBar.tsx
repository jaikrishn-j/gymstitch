import { RefreshCcw } from "lucide-react";
import { Button, Chip } from "./index";

export type SyncBarProps = {
  lastSyncedAt?: number | null;
  pendingCount?: number;
  isOnline?: boolean;
  syncing?: boolean;
  onSync: () => void;
};

function formatSyncTime(timestamp?: number | null): string {
  if (timestamp == null) return "never";
  const diff = Date.now() - timestamp;
  if (diff < 30_000) return "just now";
  if (diff < 60_000) return "1m ago";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function SyncBar({
  lastSyncedAt,
  pendingCount = 0,
  isOnline = true,
  syncing = false,
  onSync,
}: SyncBarProps) {
  return (
    <div
      className="flex items-center gap-2.5"
      style={{ flexWrap: "wrap" }}
    >
      <span className="muted small">
        {isOnline ? "Online" : "Offline"}
        <span style={{ opacity: 0.6 }}> · synced {formatSyncTime(lastSyncedAt)}</span>
      </span>
      {pendingCount > 0 ? (
        <Chip color="warning" variant="soft" size="sm">
          {pendingCount} pending sync
        </Chip>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        isDisabled={syncing}
        onPress={onSync}
      >
        <RefreshCcw
          size={14}
          style={syncing ? { animation: "spin 1s linear infinite" } : undefined}
        />
        {syncing ? "Syncing…" : "Sync now"}
      </Button>
    </div>
  );
}