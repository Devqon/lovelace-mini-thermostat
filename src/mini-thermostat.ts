import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import { HomeAssistant, hasConfigOrEntityChanged, getLovelace, fireEvent } from 'custom-card-helpers';

import { CardConfig } from './types';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  MINI-THERMOSTAT-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

@customElement('mini-thermostat')
export class MiniThermostatCard extends LitElement {
  public static getStubConfig(): object {
    return {};
  }

  @property() public hass?: HomeAssistant;
  @property() private _config?: CardConfig;

  public setConfig(config: CardConfig): void {
    this._validateConfig(config);

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = config;
  }

  private _validateConfig(config: CardConfig): void {
    if (!config || !config.entity) {
      throw new Error(localize('common.invalid_configuration'));
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const entity = this._config.entity;
    const stateObj = this.hass.states[entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.show_warning')}</div>
        </ha-card>
      `;
    }

    const currentTemperature = stateObj.attributes.current_temperature;
    const targetTemperature = stateObj.attributes.temperature;
    const unit = this.hass.config.unit_system.temperature;

    const currentTemperatureDisplay = `${Number(currentTemperature).toFixed(1)} ${unit}`;
    const currentTargetDisplay = targetTemperature == null ? `N/A` : `${Number(targetTemperature).toFixed(1)} ${unit}`;

    return html`
      <ha-card class="no-header" tabindex="0" aria-label=${`MiniThermostat: ${entity}`}>
        <div class="flex-box">
          <div class="state">
            <paper-button @click="${() => this._showEntityMoreInfo(entity)}">
              <ha-icon icon="mdi:thermometer" class="${this._getStateClass(stateObj)}"></ha-icon>
              ${currentTemperatureDisplay}
            </paper-button>
          </div>
          <div class="actions flex-box">
            <paper-button @click="${() => this._setTemperature(0.5)}" class="action">
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </paper-button>
            <paper-button @click="${() => this._showEntityMoreInfo(entity)}" class="action">
              ${currentTargetDisplay}
            </paper-button>
            <paper-button @click="${() => this._setTemperature(-0.5)}" class="action">
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </paper-button>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _getCurrentTargetTemperature(): number | null {
    if (this.hass && this._config && this.hass.states[this._config.entity]) {
      return this.hass.states[this._config.entity].attributes.temperature;
    }
    return null;
  }

  private _setTemperature(change): void {
    if (!this.hass || !this._config) {
      return;
    }
    const currentTarget = this._getCurrentTargetTemperature();
    this.hass.callService('climate', 'set_temperature', {
      entity_id: this._config.entity,
      temperature: currentTarget + change,
      hvac_mode: 'heat',
    });
  }

  private _getStateClass(stateObj): string {
    if (stateObj.attributes.current_temperature < stateObj.attributes.temperature) {
      return 'state-under';
    }
    if (stateObj.attributes.current_temperature >= stateObj.attributes.temperature) {
      return 'state-equal';
    }
    return 'state-neutral';
  }

  private _showEntityMoreInfo(entityId): void {
    const event = new Event('hass-more-info', { bubbles: true, cancelable: false, composed: true });
    (event as any).detail = { entityId };
    this.dispatchEvent(event);
  }

  static get styles(): CSSResult {
    return css`
      :host {
        --minith-default-spacing: 4px;

        --minith-default-warning-color: #fce588;
        --minith-default-success-color: #12d289;
      }
      ha-card.no-header {
        padding: calc(var(--minith-spacing, var(--minith-default-spacing)) * 4) 0;
      }
      .flex-box {
        display: flex;
        justify-content: space-between;
      }
      .state {
        padding-left: 10px;
      }
      .actions {
        display: flex;
      }
      paper-button {
        cursor: pointer;
        padding: 8px;
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      paper-button.action {
        min-width: 36px;
        display: flex;
        justify-content: center;
      }
      ha-icon.state-equal {
        color: var(--minith-success-color, var(--minith-default-success-color));
      }
      ha-icon.state-under {
        color: var(--minith-warning-color, var(--minith-default-warning-color));
      }
      .warning {
        display: block;
        color: black;
        background-color: var(--minith-warning-color, var(--minith-default-warning-color));
        padding: 8px;
      }
    `;
  }
}
