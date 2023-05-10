import { derived } from 'svelte/store'
import producerStore from './producerStore'

export const milkPerSecond = derived(producerStore, ($producerStore) => {
  return $producerStore.reduce((accumulator, producer) => {
    return accumulator + (producer.baseProductionRate * producer.multiplier * producer.numOwned)
  }, 0)
})
