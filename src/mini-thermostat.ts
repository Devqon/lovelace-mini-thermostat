import {
  LitElement,
  html,
  customElement,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  PropertyDeclarations,
} from 'lit-element';
import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import debounce from 'debounce-fn';

import { CardConfig, Values } from './types';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  MINI-THERMOSTAT-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

const UPDATE_PROPS = ['_values', 'entity', '_updating', 'unit'];

@customElement('mini-thermostat')
export class MiniThermostatCard extends LitElement {
  public static getStubConfig(): object {
    return {};
  }

  static get properties(): PropertyDeclarations {
    return {
      _values: { type: Object },
      unit: { type: String },
      _updating: { type: Boolean },
      entity: { type: Object },
      _hass: { type: Object },
      config: { type: Object },
    };
  }

  private _hass: HomeAssistant | null;
  private config: CardConfig | null;
  private entity: HassEntity | null;
  private _updating = false;
  private _values: Values = {};
  private unit: string;

  private _debounceTemperature = debounce(
    (values: Values) => {
      if (!this.config?.entity || !this._hass) return;

      const details = {
        entity_id: this.config.entity,
        ...values,
      };
      this._hass.callService('climate', 'set_temperature', details);
    },
    {
      wait: 2000,
    },
  );

  constructor() {
    super();

    this.config = null;
    this._updating = false;
    this._values = {};
    this.entity = null;
    this.unit = '';
    this._hass = null;
  }

  public setConfig(config: CardConfig): void {
    this._validateConfig(config);
    this.config = config;
  }

  set hass(hass: HomeAssistant) {
    if (!this.config) return;
    const entity = hass.states[this.config.entity];
    if (!entity) return;

    this._hass = hass;
    this.entity = entity;

    const values: Values = {
      temperature: entity.attributes.temperature,
    };
    if (this._updating && values.temperature == this._values.temperature) {
      this._updating = false;
    } else {
      this._values = values;
    }

    this.unit = hass.config.unit_system.temperature;
  }

  private _validateConfig(config: CardConfig): void {
    if (!config || !config.entity) {
      throw new Error(localize('common.invalid_configuration'));
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return UPDATE_PROPS.some(prop => changedProps.has(prop));
  }

  protected render(): TemplateResult | void {
    if (!this.config || !this._hass) {
      return html``;
    }

    const stateObj = this.entity;
    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.show_warning')}</div>
        </ha-card>
      `;
    }

    const currentTemperature = stateObj.attributes.current_temperature;
    const targetTemperature = this._values.temperature;
    const currentPresetMode = stateObj.attributes.preset_mode;

    return html`
      <ha-card class="no-header" tabindex="0" aria-label=${`MiniThermostat: ${this.config.entity}`}>
        <div class="flex-box">
          <div class="state">
            <paper-button
              @click="${() => this._showEntityMoreInfo(this.config!.entity)}"
              class="${this._getStateClass(stateObj)}"
            >
              <ha-icon icon="mdi:thermometer"></ha-icon>
              ${this._toDisplayTemperature(currentTemperature)}
            </paper-button>
          </div>
          <div class="container-preset_modes">
            <ha-paper-dropdown-menu no-label-float dynamic-align>
              <paper-listbox
                slot="dropdown-content"
                attr-for-selected="item-name"
                .selected=${currentPresetMode}
                @selected-changed=${ev => this._handlePresetmodeChanged(ev)}
              >
                ${stateObj.attributes.preset_modes.map(
                  mode => html`
                    <paper-item item-name=${mode}>
                      ${this._hass!.localize(`state_attributes.climate.preset_mode.${mode}`) || mode}
                    </paper-item>
                  `,
                )}
              </paper-listbox>
            </ha-paper-dropdown-menu>
          </div>
          <div class="actions flex-box">
            <paper-button @click="${() => this._setTemperature(0.5)}" class="action">
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </paper-button>
            <paper-button @click="${() => this._showEntityMoreInfo(this.config!.entity)}" class="action">
              <span class="${this._updating ? 'updating' : ''}">
                ${this._toDisplayTemperature(targetTemperature)}
              </span>
            </paper-button>
            <paper-button @click="${() => this._setTemperature(-0.5)}" class="action">
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </paper-button>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _toDisplayTemperature(temperature?: number, fallback = 'N/A'): string {
    return temperature ? `${Number(temperature).toFixed(1)} ${this.unit}` : fallback;
  }

  private _setTemperature(change): void {
    if (!this._hass || !this.config) {
      return;
    }
    this._updating = true;
    const currentTarget = this._values.temperature;
    this._values = {
      ...this._values,
      temperature: currentTarget + change,
    };
    this._debounceTemperature({ ...this._values });
  }

  private _handlePresetmodeChanged(ev: CustomEvent): void {
    const newVal = ev.detail.value || null;
    const serviceData = {
      entity_id: this.config!.entity,
      preset_mode: newVal,
    };
    this._hass!.callService('climate', 'set_preset_mode', serviceData);
  }

  private _getStateClass(stateObj): string {
    // null or undefined
    if (stateObj.attributes.temperature == null) {
      return 'state-inactive';
    }
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

        --minith-default-inactive-color: inherit;
        --minith-default-active-color: var(--paper-item-icon-color, #12d289);
        --minith-default-warning-color: #fce588;
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
      .container-preset_modes {
        max-width: 150px;
      }
      .actions {
        display: flex;
      }
      .updating {
        color: var(--minith-warning-color, var(--minith-default-warning-color));
      }
      paper-button {
        cursor: pointer;
        padding: 8px;
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      paper-button.action {
        min-width: 30px;
        display: flex;
        justify-content: center;
      }
      .state-inactive {
        color: var(--minit-inactive-color, var(--minith-default-inactive-color));
      }
      .state-equal {
        color: var(--minith-active-color, var(--minith-default-active-color));
      }
      .state-under {
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
