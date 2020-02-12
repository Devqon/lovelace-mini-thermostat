# Mini Thermostat Card by [@devqon](https://www.github.com/Devqon)

A small lovelace card for controlling a thermostat

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

[![Discord][discord-shield]][discord]
[![Community Forum][forum-shield]][forum]

## Installation

HACS compatible

```yaml
- url: /community_plugin/lovelace-mini-thermostat/mini-thermostat.js
  type: module
```

## Options

### Card options

| Name     | Type   | Requirement  | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| type     | string | **Required** | `custom:mini-thermostat` |
| entity   | string | **Required** | Home Assistant climate entity ID. |
| name     | string | **Optional** | A name to display in the header |
| layout   | Layout | **Optional** | See [Layout Object](#layout-object) |
| icons    | Object | **Optional** | Mapping for overriding icons |
| labels   | Object | **Optional** | Mapping for overriding labels |
| step_size | number | **Optional** | Stepsize for the up/down buttons | 0.5 |
| tap_action | Object | **Optional** | The action to perform when tapping the state. See [tap_action](https://www.home-assistant.io/lovelace/entity-button/#tap_action) | more-info |
| hold_action | Object | **Optional** | The action to perform when holding the state. See [hold_action](https://www.home-assistant.io/lovelace/entity-button/#hold_action) | more-info |
| double_tap_action | Object | **Optional** | The action to perform when double tapping the state. See [double_tap_action](https://www.home-assistant.io/lovelace/entity-button/#double_tap_action) | more-info |

### Layout Object
| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| grouped | boolean | **Optional** | Set true for smaller card (used for entities for example) | false |
| tiny | boolean | **Optional** | Set true for even tinier card (sets padding on the card to zero) | false |
| dropdown | string | **Optional** | `hvac_modes` or `preset_modes` |
| name | string | **Optional** | Render a name in the middle of the card |
| preset_buttons | List or string | **Optional** | `hvac_modes` or `preset_modes`. Can also supply custom buttons; See [Preset Button Object](#preset-button-object) |
| up_down | boolean | **Optional** | Set to false to hide the up/down buttons |

### Preset Button Object
| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| type | string | **Required** | `temperature`, `hvac_mode`, `preset_mode`, `script` or `service` |
| data | Object | **Required** | See [Data Object](#data-object) |
| icon | string | **Optional** | An optional icon to display in the preset button |
| label | string | **Optional** | An optional label to display in the preset button |
| entity | string | **Required if type = script or service** | The entity for the `script` or `service` call |

### Data Object
| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| temperature | number | **Required if type = temperature** | The target temperature |
| hvac_mode | string | **Required if type = hvac_mode** | The HVAC mode |
| preset_mode | string | **Required if type = preset_mode** | The preset mode |
| *any* | any | **Optional** | Extra data for the `script` or `service` types |

## Configuration (Installation throug HACS)

```yaml
- type: custom:mini-thermostat
  entity: climate.main_thermostat
```

## Examples

```yaml
- type: custom:mini-thermostat
  entity: climate.main_thermostat
  layout:
    dropdown: 'preset_modes'
  labels:
    'state_attributes.climate.preset_mode.Away and Eco': 'E&A'

- type: custom:mini-thermostat
  entity: climate.main_thermostat
  layout:
    name: 'Main Thermostat'

- type: custom:mini-thermostat
  entity: climate.main_thermostat
  layout:
    preset_buttons:
      - type: temperature
        data:
          temperature: 16
        label: ECO
      - type: temperature
        data:
          temperature: 20
        label: Default
      - type: service
        entity: scene.turn_on
        label: Hot
        data:
          entity_id: scene.make_it_melting

- type: entities
  entities:
    - climate.climate_one
      type: custom:mini-thermostat
      grouped: true
      layout:
        name: One
        dropdown: 'hvac_modes'
        up_down: false
    - climate.two
      type: custom:mini-thermostat
      grouped: true
      layout:
        name: Two
```

[commits-shield]: https://img.shields.io/github/commit-activity/y/Devqon/lovelace-mini-thermostat.svg?style=for-the-badge
[commits]: https://github.com/Devqon/lovelace-mini-thermostat/commits/master
[devcontainer]: https://code.visualstudio.com/docs/remote/containers
[discord]: https://discord.gg/5e9yvq
[discord-shield]: https://img.shields.io/discord/330944238910963714.svg?style=for-the-badge
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/c/projects/frontend
[license-shield]: https://img.shields.io/github/license/Devqon/lovelace-mini-thermostat.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2020.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/Devqon/lovelace-mini-thermostat.svg?style=for-the-badge
[releases]: https://github.com/Devqon/lovelace-mini-thermostat/releases
