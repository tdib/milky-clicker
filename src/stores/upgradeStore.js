import { writable } from 'svelte/store'

const upgradeStore = writable([
  // Populated at runtime with format
  // {
  //   id
  //   name
  //   description
  //   effect
  //   preconditions: []
  //   price
  //   unlocked
  // }
])

export default upgradeStore