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
const ICONS = {
  default: 'hass:thermometer',
  heat: 'hass:fire',
};

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
      if (!this.config!.entity || !this._hass) return;

      const details = {
        entity_id: this.config!.entity,
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
      throw new Error(localize('common.config.entity'));
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return UPDATE_PROPS.some(prop => changedProps.has(prop));
  }

  protected render(): TemplateResult | void {
    if (!this.config || !this._hass) {
      return html``;
    }

    if (!this.entity) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.config.not-available')}</div>
        </ha-card>
      `;
    }

    const targetTemperature = this._values.temperature;

    return html`
      <ha-card
        class="${this.config!.name ? 'with-header' : 'no-header'}"
        tabindex="0"
        aria-label=${`MiniThermostat: ${this.config.entity}`}
        .header=${this.config!.name}
      >
        <div class="flex-box">
          <div class="state">
            ${this._renderState()}
          </div>
          <div class="container-modes">
            ${this._renderDropdown()}
          </div>
          <div class="actions flex-box">
            ${this._renderTemperatureChangeButton('up')}
            <paper-button @click="${() => this._showEntityMoreInfo(this.config!.entity)}" class="action">
              <span class="${this._updating ? 'updating' : ''}">
                ${this._toDisplayTemperature(targetTemperature)}
              </span>
            </paper-button>
            ${this._renderTemperatureChangeButton('down')}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderState() {
    const relativeState = this._getRelativeState(this.entity);
    const stateIcon = relativeState === 'under' ? 'heat' : 'default';
    const currentTemperature = this.entity!.attributes.current_temperature;
    return html`
      <paper-button @click="${() => this._showEntityMoreInfo(this.config!.entity)}" class="state-${relativeState}">
        <ha-icon icon="${ICONS[stateIcon]}"></ha-icon>
        ${this._toDisplayTemperature(currentTemperature)}
      </paper-button>
    `;
  }

  private _renderDropdown() {
    if (!this.config!.dropdown) return '';

    if (this.config!.dropdown === 'hvac_modes') {
      return this._renderHvacModes();
    } else if (this.config!.dropdown === 'preset_modes') {
      return this._renderPresetModes();
    } else {
      // return what else is configured, for example a name
      return html`
        <paper-button @click=${() => this._showEntityMoreInfo(this.config!.entity)}>
          ${this.config!.dropdown}
        </paper-button>
      `;
    }
  }

  private _renderHvacModes() {
    if (!this.entity!.attributes.hvac_modes) return '';

    const modes = this.entity!.attributes.hvac_modes;
    const currentMode = this.entity!.state;
    const localizationKey = 'state.climate';

    return this._renderListbox(modes, currentMode, localizationKey, 'hvac_mode');
  }

  private _renderPresetModes() {
    if (!this.entity!.attributes.preset_mode) return '';

    if (!this.entity!.attributes.preset_modes) return this.entity!.attributes.preset_mode;

    const modes = this.entity!.attributes.preset_modes;
    const currentMode = this.entity!.attributes.preset_mode;
    const localizationKey = 'state_attributes.climate.preset_mode';

    return this._renderListbox(modes, currentMode, localizationKey, 'preset_mode');
  }

  private _renderListbox(options: string[], current: string, localizationKey: string, service: string) {
    return html`
      <ha-paper-dropdown-menu no-label-float dynamic-align>
        <paper-listbox
          slot="dropdown-content"
          attr-for-selected="item-name"
          .selected=${current}
          @selected-changed=${ev => this._handleModeChanged(ev, service)}
        >
          ${options.map(
            option => html`
              <paper-item item-name=${option}>
                ${this._hass!.localize(`${localizationKey}.${option}`) || option}
              </paper-item>
            `,
          )}
        </paper-listbox>
      </ha-paper-dropdown-menu>
    `;
  }

  private _renderTemperatureChangeButton(direction: 'up' | 'down') {
    const change = direction === 'up' ? 0.5 : -0.5;
    return html`
      <paper-button @click="${() => this._setTemperature(change)}" class="action">
        <ha-icon icon="mdi:chevron-${direction}"></ha-icon>
      </paper-button>
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

  private _handleModeChanged(ev: CustomEvent, name: string): void {
    const newVal = ev.detail.value;
    if (newVal) {
      const currentMode =
        this.config!.dropdown === 'hvac_modes' ? this.entity!.state : this.entity!.attributes.preset_mode;
      // prevent heating while in idle
      if (currentMode !== newVal) {
        const serviceData = {
          entity_id: this.config!.entity,
          [name]: newVal,
        };
        this._hass!.callService('climate', `set_${name}`, serviceData);
      }
    }
  }

  private _getRelativeState(stateObj): string {
    if (stateObj.state === 'off' || stateObj.attributes.temperature == null) {
      return 'inactive';
    }
    if (stateObj.attributes.current_temperature < stateObj.attributes.temperature) {
      return 'under';
    }
    if (stateObj.attributes.current_temperature >= stateObj.attributes.temperature) {
      return 'equal';
    }
    return 'neutral';
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
      .container-modes {
        max-width: 150px;
        display: flex;
        align-items: center;
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
