import { writable } from 'svelte/store'

const producerStore = writable([
  // Filled in at runtime with format
  // {
  //  name
  //  description
  //  baseCost
  //  baseProductionRate
  //  numOwned
  //  multiplier
  // }

])

export default producerStore