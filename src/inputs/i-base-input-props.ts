/**
 * Input Component Contract
 *
 * Every input component in src/inputs/ follows this pattern:
 *
 *   React.FC<I<Type>Input & IUpdateInput>
 *
 * where:
 *   - I<Type>Input  comes from webslider-sdk/lib/inputs/i-inputs and describes
 *                   the shape of the value + display metadata (displayName,
 *                   helperText, inputProps, etc.)
 *   - IUpdateInput  comes from the same file and provides the three callbacks:
 *                   onChange, onInput, onPreview
 *
 * Callback semantics
 * ──────────────────
 * onChange  — fires when the user commits a value (blur, select, toggle)
 * onInput   — fires on every keystroke / intermediate change (text, number)
 * onPreview — fires during drag/hover for live preview without committing
 *
 * Not every input uses all three. Text inputs use onInput; color inputs use
 * onChange + onPreview; number inputs use onInput only.
 *
 * Factory entry points
 * ────────────────────
 * getInputForm()           — low-level, maps InputType → JSX element
 * getInputFormWithOptions() — wraps getInputForm, applies metadata.disabled
 *
 * Helper functions in input-utils.tsx build the input definition object and
 * delegate to getInputForm(). Use those helpers in panel/form code rather
 * than constructing the definition object by hand.
 *
 * Known duplicates (do not add more — consolidate instead)
 * ─────────────────────────────────────────────────────────
 * Numeric:  number-input, units-number-input, numberic-timeline-input
 * Size:     size-input, size-unit-input, size-pos-input
 * Color:    color-input, color-array-input, color-gradient-input,
 *           linear-gradient-input, border-color-input
 * Text:     text-input, textarea-input, rich-textarea-input,
 *           svg-textarea-input, html-input
 */

export type { OnChangeType, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
