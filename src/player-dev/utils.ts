export function getSliderOptionsFromLocalStorage() {
  const exports = JSON.parse(localStorage.getItem("exports") || "{}");
  const keys = Object.keys(exports);

  const options: { label: string; value: string }[] = [];
  keys.forEach((key) => {
    const data = exports[key];
    options.push({ label: data.name, value: key });
  });
  return options;
}
