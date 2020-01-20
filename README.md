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
- url: /community_plugin/mini-thermostat.js
  type: module
```

## Options

| Name              | Type    | Requirement  | Description                                 | Default             |
| ----------------- | ------- | ------------ | ------------------------------------------- | ------------------- |
| type              | string  | **Required** | `custom:mini-thermostat`                    |                     |
| entity            | string  | **Required** | Home Assistant climate entity ID.           |                     |

## Configuration (Installation throug HACS)

```yaml
- type: custom:mini-thermostat
  entity: climate.main_thermostat
```