const units = [
  { magnitude: 1e-3, unit: 'microlitre' },
  { magnitude: 1, unit: 'millilitre' },
  { magnitude: 1e3, unit: 'litre' },
  { magnitude: 1e6, unit: 'kilolitre' },
  { magnitude: 1e9, unit: 'megalitre' },
  { magnitude: 1e12, unit: 'gigalitre' },
  { magnitude: 1e15, unit: 'teralitre' },
  // { magnitude: 1e18, unit: 'petalitre' },
  // { magnitude: 1e21, unit: 'exalitre' },
  // { magnitude: 1e24, unit: 'zettalitre' },
]



/**
 * Takes a decimal value and formats it in the form "<number> <unit>"
 * e.g. "3.205 nanolitres"
 */
export function formatVolume(value) {
  if (value === 0) {
    return "no"
  }
  // Check if the current value exists as a key - in this case we don't add an "s" at the end of the unit
  let sFlag = !units.some((unit) => unit.magnitude === value)

  // Finds the first magnitude where the argument value is higher - this is the most relevant unit
  for (let i = units.length - 1; i >= 0; i--) {
    if (Math.abs(value) >= units[i].magnitude) {
      return `${(value/units[i].magnitude).toPrecision(5)} ${units[i].unit}${sFlag ? 's' : ''}`
    }
  }

  return "an unknown amount"
}
