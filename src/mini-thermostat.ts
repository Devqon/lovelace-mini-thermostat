import {
  LitElement,
  html,
  customElement,
  CSSResult,
  TemplateResult,
  PropertyValues,
  PropertyDeclarations,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { HomeAssistant, hasAction, ActionHandlerEvent, handleAction } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import debounce from 'debounce-fn';

import { CardConfig, Values, PresetButtonConfig } from './types';
import { CARD_VERSION, CURRENT_HVAC_IDLE, CURRENT_HVAC_OFF } from './const';
import { actionHandler } from './action-handler-directive';
import styles from './styles';

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
  cool: 'hass:snowflake',
  heat: 'hass:fire',
  up: 'mdi:chevron-up',
  down: 'mdi:chevron-down',
};
const DEFAULT_STEP_SIZE = 0.5;

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
      if (!this.config!.entity || !this.hass) return;

      const details = {
        entity_id: this.config!.entity,
        ...values,
      };
      this.hass.callService('climate', 'set_temperature', details);
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
    this._hass = hass;

    if (!this.config) return;
    const entity = hass.states[this.config.entity];
    if (!entity) return;
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

  get hass() {
    return this._hass!;
  }

  private _validateConfig(config: CardConfig): void {
    const throwError = (error: string) => {
      throw new Error(error);
    };
    if (!config || !config.entity) {
      throwError(localize('common.config.entity'));
    }
    if (config.layout) {
      if (config.layout.dropdown) {
        if (config.layout.dropdown !== 'hvac_modes' && config.layout.dropdown !== 'preset_modes') {
          throwError(localize('common.config.dropdown'));
        }
      }
      if (config.layout.preset_buttons) {
        if (!Array.isArray(config.layout.preset_buttons)) {
          if (config.layout.preset_buttons !== 'hvac_modes' && config.layout.preset_buttons !== 'preset_modes')
            throwError('Invalid configuration for preset_buttons');
        } else {
          config.layout.preset_buttons.forEach(button => {
            if (!button.data) {
              throwError('Missing option: data');
            }
            if (button.type === 'temperature' && typeof button.data.temperature !== 'number') {
              throwError('Temperature should be a number');
            }
            if (button.type === 'hvac_mode' && !button.data.hvac_mode) {
              throwError('Missing option: data.hvac_mode');
            }
            if (button.type === 'preset_mode' && !button.data.preset_mode) {
              throwError('Missing option: data.preset_mode');
            }
            if ((button.type === 'script' || button.type === 'service') && !button.entity) {
              throwError('Missing option: entity');
            }
          });
        }
      }
    }
  }

  private _getIcon(name: string) {
    if (this.config?.icons && this.config.icons[name]) {
      return this.config.icons[name];
    }
    return ICONS[name] || name;
  }

  private _getLabel(name: string, fallback?: string) {
    if (this.config?.labels && this.config.labels[name]) {
      return this.config.labels[name];
    }
    return this.hass.localize(name) || fallback;
  }

  private shouldRenderUpDown() {
    return this.config!.layout?.up_down !== false;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return UPDATE_PROPS.some(prop => changedProps.has(prop));
  }

  protected render(): TemplateResult | void {
    if (!this.config || !this.hass) {
      return html``;
    }

    if (!this.entity) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.config.not-available')}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card
        class="${this._computeClasses()}"
        tabindex="0"
        aria-label="${`MiniThermostat: ${this.config.entity}`}"
        .header="${this.config!.name}"
      >
        <div class="flex-box">
          <div class="state">
            ${this._renderState()}
          </div>
          <div class="container-middle">
            ${this._renderMiddle()}
          </div>
          ${this._renderEnd()}
        </div>
      </ha-card>
    `;
  }

  private _renderState() {
    const relativeState = this._getRelativeState(this.entity);
    const stateIcon = relativeState === 'under' ? 'heat' : relativeState === 'above' ? 'cool' : 'default';
    const currentTemperature = this.entity!.attributes.current_temperature;
    return html`
      <mwc-button
        dense
        class="state-${relativeState}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config!.hold_action),
          hasDoubleTap: hasAction(this.config!.double_tap_action),
          repeat: this.config!.hold_action ? this.config!.hold_action.repeat : undefined,
        })}
      >
        <ha-icon icon="${this._getIcon(stateIcon)}"></ha-icon>
        ${this._toDisplayTemperature(currentTemperature)}
      </mwc-button>
    `;
  }

  private _renderMiddle() {
    if (!this.config?.layout) return '';

    const middle: any[] = [];
    if (this.config!.layout.name) {
      middle.push(this._renderName(this.config!.layout.name));
    }
    if (this.config!.layout.dropdown) {
      middle.push(this._renderDropdown(this.config!.layout.dropdown));
    }
    if (this.config!.layout.preset_buttons) {
      middle.push(this._renderPresetButtons());
    }

    return html`
      ${middle.map(
        item =>
          html`
            ${item}
          `,
      )}
    `;
  }

  private _renderDropdown(dropdown: string) {
    if (dropdown === 'hvac_modes') {
      return this._renderHvacModesDropdown();
    } else if (dropdown === 'preset_modes') {
      return this._renderPresetModesDropdown();
    }
    return '';
  }

  private _renderName(name: string) {
    return html`
      <mwc-button dense @click=${() => this._showEntityMoreInfo()}>
        ${name}
      </mwc-button>
    `;
  }

  private _renderHvacModesDropdown() {
    if (!this.entity!.attributes.hvac_modes) return '';

    const modes = this.entity!.attributes.hvac_modes;
    const currentMode = this.entity!.state;
    const localizationKey = 'state.climate';

    return this._renderListbox(modes, currentMode, localizationKey, 'hvac_mode');
  }

  private _renderPresetModesDropdown() {
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
          .selected="${current}"
          @selected-changed="${ev => this._handleModeChanged(ev, service, current)}"
        >
          ${options.map(
            option => html`
              <paper-item item-name=${option}>
                ${this._getLabel(`${localizationKey}.${option}`, option)}
              </paper-item>
            `,
          )}
        </paper-listbox>
      </ha-paper-dropdown-menu>
    `;
  }

  private _renderPresetButtons({ config, entity } = this) {
    if (!config?.layout?.preset_buttons || !entity) return '';

    if (Array.isArray(config.layout.preset_buttons)) {
      return html`
        ${config.layout.preset_buttons.map(button => this._renderPresetButton(button))}
      `;
    } else {
      if (config.layout.preset_buttons === 'preset_modes') {
        return html`
          ${entity.attributes.preset_modes.map(mode => this._renderSetPresetModeButton(mode))}
        `;
      } else if (config.layout.preset_buttons === 'hvac_modes') {
        return html`
          ${entity.attributes.hvac_modes.map(mode => this._renderSetHvacModeButton(mode))}
        `;
      } else {
        return '';
      }
    }
  }

  private _renderPresetButton(button: PresetButtonConfig) {
    switch (button.type) {
      case 'temperature':
        return this._renderSetTemperatureButton(button.data.temperature!, button.icon, button.label);
      case 'hvac_mode':
        return this._renderSetHvacModeButton(button.data.hvac_mode!, button.icon, button.label);
      case 'preset_mode':
        return this._renderSetPresetModeButton(button.data.preset_mode!, button.icon, button.label);
      case 'script':
        return this._renderScriptButton(button.entity!, button.data, button.icon, button.label);
      case 'service':
        return this._renderServiceButton(button.entity!, button.data, button.icon, button.label);
      default:
        return '';
    }
  }

  private _renderSetTemperatureButton(temperature: number, icon?: string, label?: string) {
    const isCurrentTargetTemperature = this.entity?.attributes.temperature === temperature;
    const action = () => this._setTemperature(temperature);
    if (!icon && !label) {
      label = this._toDisplayTemperature(temperature);
    }
    return this._renderActionButton(action, isCurrentTargetTemperature, icon, label);
  }

  private _renderSetHvacModeButton(mode: string, icon?: string, label?: string) {
    const isCurrentHvacMode = this.entity!.state === mode;
    const action = () => this._setMode('hvac_mode', mode);
    if (!icon && !label) {
      label = this._getLabel(`state.climate.${mode}`, mode);
    }
    return this._renderActionButton(action, isCurrentHvacMode, icon, label);
  }

  private _renderSetPresetModeButton(mode: string, icon?: string, label?: string) {
    const isCurrentPresetMode = this.entity!.attributes.preset_mode === mode;
    const action = () => this._setMode('preset_mode', mode);
    if (!icon && !label) {
      label = this._getLabel(`state_attributes.climate.preset_mode.${mode}`, mode);
    }
    return this._renderActionButton(action, isCurrentPresetMode, icon, label);
  }

  private _renderScriptButton(entity: string, data: any, icon?: string, label?: string) {
    const action = () => this._callScript(entity, data);
    return this._renderActionButton(action, false, icon, label);
  }

  private _renderServiceButton(entity: string, data: any, icon?: string, label?: string) {
    const action = () => this._callService(entity, data);
    return this._renderActionButton(action, false, icon, label);
  }

  private _renderActionButton(action: () => any, active: boolean, icon?: string, label?: string) {
    return html`
      <mwc-button dense .raised="${active}" .outlined="${!active}" @click="${action}">
        ${icon
          ? html`
              <ha-icon icon="${this._getIcon(icon)}"></ha-icon>
            `
          : label}
      </mwc-button>
    `;
  }

  private _renderTemperatureChangeButton(change: number) {
    const direction = change >= 0 ? 'up' : 'down';
    return html`
      <paper-icon-button
        title="Temperature ${direction}"
        class="change-arrow"
        icon="${this._getIcon(`${direction}`)}"
        @click="${() => this._changeTemperature(change)}"
        class="action"
      >
      </paper-icon-button>
    `;
  }

  private _renderEnd({ temperature: targetTemperature } = this._values) {
    const upDown = this.shouldRenderUpDown();
    const step_size = this.config!.step_size || DEFAULT_STEP_SIZE;
    return upDown
      ? html`
          <div class="actions flex-box">
            ${this._renderTemperatureChangeButton(+step_size)}
            <mwc-button dense @click="${() => this._showEntityMoreInfo()}">
              <span class="${this._updating ? 'updating' : ''}">
                ${this._toDisplayTemperature(targetTemperature)}
              </span>
            </mwc-button>
            ${this._renderTemperatureChangeButton(-step_size)}
          </div>
        `
      : '';
  }

  private _toDisplayTemperature(temperature?: number, fallback = 'N/A'): string {
    return temperature ? `${Number(temperature).toFixed(1)} ${this.unit}` : fallback;
  }

  private _changeTemperature(change): void {
    if (!this.hass || !this.config) {
      return;
    }
    const currentTarget = this._values.temperature;
    this._setTemperature(currentTarget + change);
  }

  private _setTemperature(temperature): void {
    if (!this.hass || !this.config) {
      return;
    }
    this._updating = true;
    this._values = {
      ...this._values,
      temperature,
    };
    this._debounceTemperature({ ...this._values });
  }

  private _callScript(entity: string, data: any): void {
    const split = entity.split('.')?.pop();
    if (!split || !split.length) {
      return;
    }
    this.hass.callService('script', split, ...data);
  }

  private _callService(entity: string, data: any): void {
    const [domain, service] = entity.split('.');
    this.hass.callService(domain, service, ...data);
  }

  private _handleModeChanged(ev: CustomEvent, modeType: string, current: string): void {
    const newVal = ev.detail.value;
    // prevent heating while in idle by checking for current
    if (newVal && newVal !== current) {
      this._setMode(modeType, newVal);
    }
  }

  private _setMode(modeType: string, value: string): void {
    const serviceData = {
      entity_id: this.config!.entity,
      [modeType]: value,
    };
    this.hass.callService('climate', `set_${modeType}`, serviceData);
  }

  private _getRelativeState(stateObj): string {
    const targetTemperature = stateObj.attributes.temperature;
    if (
      stateObj.state === CURRENT_HVAC_OFF ||
      stateObj.state === CURRENT_HVAC_IDLE ||
      targetTemperature == null ||
      stateObj.attributes.hvac_action === CURRENT_HVAC_OFF ||
      stateObj.attributes.hvac_action === CURRENT_HVAC_IDLE
    ) {
      return 'inactive';
    }
    const currentTemperature = stateObj.attributes.current_temperature;
    if (currentTemperature < targetTemperature) {
      return 'under';
    }
    if (currentTemperature === targetTemperature) {
      return 'equal';
    }
    if (currentTemperature > targetTemperature) {
      return 'above';
    }
    return 'neutral';
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showEntityMoreInfo({ entity } = this.config!): void {
    const event = new Event('hass-more-info', { bubbles: true, cancelable: false, composed: true });
    (event as any).detail = { entityId: entity };
    this.dispatchEvent(event);
  }

  private _computeClasses({ config } = this) {
    if (!config) return '';
    const hasHeader = !!config.name;
    return classMap({
      grouped: config.layout?.grouped || false,
      'with-header': hasHeader,
      'no-header': !hasHeader,
      tiny: config.layout?.tiny || false,
    });
  }

  static get styles(): CSSResult {
    return styles;
  }

  getCardSize(): number {
    return 1;
  }
}
