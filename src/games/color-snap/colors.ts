/**
 * Color generation utilities for Color Snap game.
 * Uses HSL color space for perceptual uniformity.
 */

export interface GameColor {
  h: number
  s: number
  l: number
  label: string
  css: string
}

const COLOR_NAMES: Record<string, [number, number]> = {
  Red: [0, 15],
  Orange: [15, 45],
  Yellow: [45, 65],
  Lime: [65, 80],
  Green: [80, 160],
  Teal: [160, 190],
  Cyan: [190, 210],
  Blue: [210, 260],
  Indigo: [260, 280],
  Purple: [280, 310],
  Pink: [310, 340],
  Rose: [340, 360],
}

function hslToCSS(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

function getColorName(hue: number): string {
  const normalizedHue = ((hue % 360) + 360) % 360
  for (const [name, [min, max]] of Object.entries(COLOR_NAMES)) {
    if (normalizedHue >= min && normalizedHue < max) return name
  }
  return 'Red'
}

/**
 * Calculate perceptual distance between two HSL colors.
 * Weighted to account for human perception.
 */
function colorDistance(a: GameColor, b: GameColor): number {
  const hDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h))
  const sDiff = Math.abs(a.s - b.s)
  const lDiff = Math.abs(a.l - b.l)
  return Math.sqrt(hDiff * hDiff * 2 + sDiff * sDiff + lDiff * lDiff * 1.5)
}

function createColor(h: number, s: number, l: number): GameColor {
  return {
    h: ((h % 360) + 360) % 360,
    s: Math.max(0, Math.min(100, s)),
    l: Math.max(0, Math.min(100, l)),
    label: getColorName(h),
    css: hslToCSS(h, s, l),
  }
}

/**
 * Generate a random target color with good saturation and medium lightness
 * so it's clearly visible against the dark background.
 */
export function generateTargetColor(): GameColor {
  const h = Math.random() * 360
  const s = 55 + Math.random() * 35 // 55-90%
  const l = 45 + Math.random() * 20 // 45-65%
  return createColor(h, s, l)
}

/**
 * Generate distractor colors that are similar to the target based on difficulty.
 *
 * @param target - The target color to generate distractors for
 * @param count - Number of distractor colors to generate
 * @param difficulty - 0 to 1, where 1 is hardest (most similar colors)
 */
export function generateDistractors(
  target: GameColor,
  count: number,
  difficulty: number
): GameColor[] {
  const distractors: GameColor[] = []
  // Higher difficulty = smaller offset ranges = more similar colors
  const minHueOffset = 15 + (1 - difficulty) * 80 // 15-95 degrees
  const maxHueOffset = minHueOffset + 40 + (1 - difficulty) * 60
  const satRange = 10 + (1 - difficulty) * 25
  const lightRange = 8 + (1 - difficulty) * 20

  let attempts = 0
  while (distractors.length < count && attempts < 200) {
    attempts++
    const hueOffset = (Math.random() > 0.5 ? 1 : -1) *
      (minHueOffset + Math.random() * (maxHueOffset - minHueOffset))
    const satOffset = (Math.random() - 0.5) * 2 * satRange
    const lightOffset = (Math.random() - 0.5) * 2 * lightRange

    const candidate = createColor(
      target.h + hueOffset,
      target.s + satOffset,
      target.l + lightOffset
    )

    // Make sure distractor is distinct enough from target (not too close)
    const dist = colorDistance(target, candidate)
    const minDist = 10 + (1 - difficulty) * 15

    // Also check against existing distractors
    const tooCloseToExisting = distractors.some(
      (d) => colorDistance(d, candidate) < minDist * 0.7
    )

    if (dist >= minDist && !tooCloseToExisting) {
      distractors.push(candidate)
    }
  }

  // Fallback: if we couldn't generate enough, fill with clearly different colors
  while (distractors.length < count) {
    const h = (target.h + 90 + distractors.length * 60) % 360
    distractors.push(createColor(h, target.s, target.l))
  }

  return distractors
}

/**
 * Generate a full round of colors: one target + distractors, shuffled.
 */
export function generateRound(
  circleCount: number,
  difficulty: number
): { target: GameColor; options: GameColor[]; targetIndex: number } {
  const target = generateTargetColor()
  const distractors = generateDistractors(target, circleCount - 1, difficulty)

  const options = [...distractors]
  const targetIndex = Math.floor(Math.random() * circleCount)
  options.splice(targetIndex, 0, target)

  return { target, options, targetIndex }
}

/**
 * Get the number of circles for a given difficulty level.
 * Starts at 4 and increases to 6.
 */
export function getCircleCount(difficulty: number): number {
  if (difficulty < 0.3) return 4
  if (difficulty < 0.6) return 5
  return 6
}
