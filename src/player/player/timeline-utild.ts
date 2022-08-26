/**
 * Check if child timeline playable bounds
 *
 * @param parentTime parent timeline time
 * @param childDelay child delay
 * @param childDuration child duration
 * @returns
 */
export function isTimelineInBounds(
  parentTime: number,
  childDelay: number,
  childDuration: number
) {
  if (parentTime >= childDelay) {
    if (childDuration === -1) {
      return true;
    } else if (parentTime <= childDelay + childDuration) {
      return true;
    }
  }

  return false;
}

export function isReverse(parentTime: number, childDelay: number) {
  return parentTime < childDelay;
}
