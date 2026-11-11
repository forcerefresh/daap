// Icon state colors for use in JSX props — mirrors tokens.scss $daap-icon-* values.
// Use these instead of hardcoded hex strings in Blueprint Icon color props.
export const ICON_COLORS = {
  inactive: '#808080',   // $daap-icon-inactive — link/aspect-ratio buttons, neutral state
  disabled: '#666666',   // $daap-icon-disabled — item is turned off but not in error
  neutral: '#bbbbbb',    // $daap-icon-neutral  — no state / nothing selected
  danger: '#ff5151',     // $daap-icon-danger   — error or disabled-with-overrides state
  enabled: '#34ec43',    // $daap-color-device-all-dark — all devices / item enabled
} as const;
