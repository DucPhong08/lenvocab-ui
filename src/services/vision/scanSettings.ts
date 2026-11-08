import type { ScanSettings, User } from '@/api/contracts';

const defaults: ScanSettings = {
  max_detected_objects: 5,
  max_allowed_objects: 5,
  confidence_threshold: 0.5,
};

export function scanSettings(user: User | null): ScanSettings {
  if (user?.scan_settings) return user.scan_settings;
  return {
    ...defaults,
    max_detected_objects: Math.min(
      user?.preferences.max_detected_objects ?? defaults.max_detected_objects,
      defaults.max_allowed_objects,
    ),
  };
}
