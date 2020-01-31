export interface CardConfig {
  type: string;
  entity: string;
  name?: string;
  layout?: CardLayoutConfig;
  icons?: { [key: string]: string };
  labels?: { [key: string]: string };
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
  temperature: number;
  icon?: string;
  name?: string;
  show_temperature?: boolean;
}

export interface Values {
  temperature?: number;
}
