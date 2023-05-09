import { writable } from 'svelte/store'

const globalStore = writable({
  milk: 0,
  allTimeMilk: 0,
  milkPerSecond: 0,
  milkPerClick: 1,

  style: 'dib',
  tier: 1,
})

export default globalStore

// const globalStore = () => {
//   const state = {
//     milk: 0,
//     milkPerSecond: 0,
//     milkPerClick: 1
//   }

//   const { subscribe, set, update } = writable(state)

//   const methods = {}

//   return {
//     subscribe,
//     ...methods
//   }
// }


// export default globalStore()
