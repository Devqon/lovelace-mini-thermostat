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

### Layout Object
| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| dropdown | string | **Optional** | `hvac_modes` or `preset_modes` |
| name | string | **Optional** | Render a name in the middle of the card |
| preset_buttons | List | **Optional** | See [Preset Button Object](#preset-button-object) |

### Preset Button Object
| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| temperature | number | **Required** | The target temperature |
| icon | string | **Optional** | An optional icon to display in the preset button |
| name | string | **Optional** | An optional name to display in the preset button |

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
    dropdown: 'hvac_modes'

- type: custom:mini-thermostat
  entity: climate.main_thermostat
  layout:
    name: 'Main Thermostat'

- type: custom:mini-thermostat
  entity: climate.main_thermostat
  layout:
    preset_buttons:
      - temperature: 16
        name: ECO
      - temperature: 20
        name: Default
      - temperature: 22
        icon: hass:fire
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
