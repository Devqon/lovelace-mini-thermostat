import { ActionConfig } from "custom-card-helpers";

export interface CardConfig {
  type: string;
  entity: string;
  name?: string;
  layout?: CardLayoutConfig;
  icons?: { [key: string]: string };
  labels?: { [key: string]: string };
  step_size?: number;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface CardLayoutConfig {
  grouped?: boolean;
  tiny?: boolean;
  dropdown?: 'hvac_modes' | 'preset_modes';
  name?: string;
  preset_buttons?: PresetButtonConfig[] | 'hvac_modes' | 'preset_modes';
  up_down?: boolean;
}

export interface PresetButtonConfig {
  type: 'temperature' | 'hvac_mode' | 'preset_mode' | 'script' | 'service';
  data: PresetButtonData;
  icon?: string;
  label?: string;
  entity?: string; // for script | service
}

export interface PresetButtonData {
  temperature?: number;
  hvac_mode?: string;
  preset_mode?: string;
  // for script | service data
  [key: string]: any;
}

export interface Values {
  temperature?: number;
}
