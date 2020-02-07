import { css } from 'lit-element';

export default css`
  :host {
    --mt-default-spacing: 2px;

    --mt-default-active-color: var(--paper-item-icon-color, #12d289);
    --mt-default-inactive-color: var(--paper-item-icon-color, #12d289);
    --mt-default-warning-color: #fce588;
  }
  ha-card.no-header {
    padding: calc(var(--mt-spacing, var(--mt-default-spacing)) * 4) 0;
  }
  ha-card.with-header .card-header {
    padding: 0 24px;
  }
  ha-card.grouped {
    box-shadow: none;
    padding: 0;
  }
  ha-card.grouped .state {
    padding-left: 0;
    width: 104px;
  }
  ha-card.grouped .state mwc-button {
    padding-left: 0;
  }
  ha-card.grouped mwc-button {
    padding-top: 0;
    padding-bottom: 0;
  }
  ha-card.tiny {
    padding: 0;
  }
  .flex-box {
    display: flex;
    justify-content: space-between;
  }
  .container-middle {
    display: flex;
    align-items: center;
  }
  .container-middle ha-paper-dropdown-menu {
    max-width: 150px;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
  }
  .actions paper-icon-button {
    height: 100%;
  }
  .actions mwc-button {
    width: 30px;
    display: flex;
    justify-content: center;
  }
  .updating {
    color: var(--mt-warning-color, var(--mt-default-warning-color));
  }
  mwc-button {
    cursor: pointer;
    padding: 8px;
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  mwc-button.action {
    min-width: 30px;
    display: flex;
    justify-content: center;
  }
  .state-inactive {
    --mdc-theme-primary: var(--mt-inactive-color, var(--mt-default-inactive-color));
  }
  .state-equal {
    --mdc-theme-primary: var(--mt-active-color, var(--mt-default-active-color));
  }
  .state-under {
    --mdc-theme-primary: var(--mt-warning-color, var(--mt-default-warning-color));
  }
  .warning {
    display: block;
    color: black;
    background-color: var(--mt-warning-color, var(--mt-default-warning-color));
    padding: 8px;
  }
`;
