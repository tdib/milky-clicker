import { writable } from 'svelte/store'

const generalStore = writable({
  milk: 0,
  allTimeMilk: 0,
  milkPerClick: 1,

  style: 'dib',
  tier: 1,
  globalMultiplier: 1
})


export default generalStore