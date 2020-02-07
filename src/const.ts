export const CARD_VERSION = '0.1.0';

// All activity disabled / Device is off/standby
export const HVAC_MODE_OFF = 'off';

// Heating
export const HVAC_MODE_HEAT = 'heat';

// Cooling
export const HVAC_MODE_COOL = 'cool';

// The device supports heating/cooling to a range
export const HVAC_MODE_HEAT_COOL = 'heat_cool';

// The temperature is set based on a schedule, learned behavior, AI or some
// other related mechanism. User is not able to adjust the temperature
export const HVAC_MODE_AUTO = 'auto';

// Device is in Dry/Humidity mode
export const HVAC_MODE_DRY = 'dry';

// Only the fan is on, not fan and another mode like cool
export const HVAC_MODE_FAN_ONLY = 'fan_only';

export const HVAC_MODES = [
  HVAC_MODE_OFF,
  HVAC_MODE_HEAT,
  HVAC_MODE_COOL,
  HVAC_MODE_HEAT_COOL,
  HVAC_MODE_AUTO,
  HVAC_MODE_DRY,
  HVAC_MODE_FAN_ONLY,
];

// No preset is active
export const PRESET_NONE = 'none';

// Device is running an energy-saving mode
export const PRESET_ECO = 'eco';

// Device is in away mode
export const PRESET_AWAY = 'away';

// Device turn all valve full up
export const PRESET_BOOST = 'boost';

// Device is in comfort mode
export const PRESET_COMFORT = 'comfort';

// Device is in home mode
export const PRESET_HOME = 'home';

// Device is prepared for sleep
export const PRESET_SLEEP = 'sleep';

// Device is reacting to activity (e.g. movement sensors)
export const PRESET_ACTIVITY = 'activity';

// This are support current states of HVAC
export const CURRENT_HVAC_OFF = 'off';
export const CURRENT_HVAC_HEAT = 'heating';
export const CURRENT_HVAC_COOL = 'cooling';
export const CURRENT_HVAC_DRY = 'drying';
export const CURRENT_HVAC_IDLE = 'idle';
export const CURRENT_HVAC_FAN = 'fan';
