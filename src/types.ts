export interface CardConfig {
  type: string;
  entity: string;
  name?: string;
  layout?: CardLayoutConfig;
}

export interface CardLayoutConfig {
  dropdown?: 'hvac_modes' | 'preset_modes';
  name?: string;
  preset_buttons?: PresetButtonConfig[];
}

export interface PresetButtonConfig {
  temperature: number;
  icon?: string;
  name?: string;
}

export interface Values {
  temperature?: number;
}
