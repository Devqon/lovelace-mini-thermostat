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

| Name              | Type    | Requirement  | Description                                                                | Default             |
| ----------------- | ------- | ------------ | -------------------------------------------------------------------------- | ------------------- |
| type              | string  | **Required** | `custom:mini-thermostat`                                                   |                     |
| entity            | string  | **Required** | Home Assistant climate entity ID.                                          |                     |
| dropdown          | string  | **Optional** | Which dropdown to show. Current options are 'hvac_modes' or 'preset_modes' |                     |

## Configuration (Installation throug HACS)

```yaml
- type: custom:mini-thermostat
  entity: climate.main_thermostat
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