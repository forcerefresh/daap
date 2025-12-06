/**
 * Calculates and formats aspect ratio based on width and height
 * @param width - The width dimension
 * @param height - The height dimension
 * @returns Formatted aspect ratio as { vertical: number, horizontal: number }
 */
export function calculateAspectRatio(width: number, height: number): Ratio {
  // Calculate the greatest common divisor (GCD) to simplify the ratio
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = gcd(width, height);
  let vertical = height / divisor;
  let horizontal = width / divisor;

  // Apply formatting rules
  if (vertical > 100 || horizontal > 100) {
    // Rule 2: If either value is > 100, use one decimal place
    const ratio = width / height;
    if (vertical > horizontal) {
      vertical = parseFloat((vertical / horizontal).toFixed(1));
      horizontal = 1;
    } else {
      horizontal = parseFloat((horizontal / vertical).toFixed(1));
      vertical = 1;
    }
  } else {
    // Rule 1: Both values ≤ 100, use whole numbers
    vertical = Math.round(vertical);
    horizontal = Math.round(horizontal);
  }

  return { vertical, horizontal };
}

export function generateFilename(docType: string): string {
  const now = new Date();

  // Format date as YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Format time as HH:MM (24-hour format)
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${docType} ${year}-${month}-${day} ${hours}:${minutes}`;
}
