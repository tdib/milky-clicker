<script>
  import producerStore from '../../stores/producerStore'
  import upgradeStore from '../../stores/upgradeStore'
  import generalStore from '../../stores/generalStore'
  import { formatVolume } from '$lib/util/numberFormatter'

  export let id
  let idx = $upgradeStore.findIndex((upgrade) => upgrade.id === id)
  const { name, description, effects, preconditions, price } = $upgradeStore[idx]

  // Update whether the user can afford the upgrade
  $: canAfford = $generalStore.milk >= price
  
  // Update whether the upgrade is locked based on its preconditions
  $: {
    $upgradeStore[idx].unlocked = checkPreconditions()

    // Add producer store as a dependency to this reactive block
    // so that it will recompute when the producer store changes
    $producerStore
  }

  // Find a given producer object based on the name
  function getProducer(name) {
    return $producerStore.find((producer) => producer.name.toLowerCase() === name.toLowerCase())
  }

  /**
   * Compute whether the upgrade is unlocked (i.e. visible to the user) based on the provided preconditions
   * 
   * @returns {boolean} Whether the upgrade is unlocked
   * 
   * There are four types of preconditions:
   * 
   * 1. Upgrades - an array of upgrade IDs that must be purchased
   * 2. Producers - an object of producer names and quantities that must be owned
   * 3. Tier - the minimum milk tier required to unlock the upgrade
   * 4. Clicks - the minimum number of clicks required to unlock the upgrade
   */
  function checkPreconditions() {
    // Check if the user owns the required producers
    function ownsProducer(name, quantity) {
      return getProducer(name).numOwned >= quantity
    }

    // Check if the user owns the required upgrades
    function ownsUpgrade(id) {
      return $upgradeStore.find((upgrade) => upgrade.id === id).purchased
    }

    let meetsConditions = true
    // Check each precondition, and if any fail, set the flag to false - keeping the upgrade locked
    Object.keys(preconditions).forEach((precondition) => {
      switch (precondition) {
        case 'upgrades':
          preconditions.upgrades.forEach((upgrade) => {
            if (!ownsUpgrade(upgrade)) meetsConditions = false
          })
          break
        case 'producers':
          Object.entries(preconditions.producers).forEach(([producer, quantity]) => {
            if (!ownsProducer(producer, quantity)) meetsConditions = false
          })
          break
        case 'tier':
          if ($generalStore.tier < preconditions.tier) meetsConditions = false
          break
        case 'clicks':
          if ($generalStore.numClicks < preconditions.clicks) meetsConditions = false
          break
      }
    })

    return meetsConditions
  }

  /**
   * Handle the purchase of an upgrade - will make the upgrade purchased and apply its effects
   * 
   * There are five types of effects:
   * 
   * 1. Milk per click multiplier - a multiplier to the milk per click
   * 2. Global multiplier - a multiplier to the overall milk per second
   * 3. Producer multiplier - a multiplier to the production rate of a given producer
   * 4. Base production rate - a new base production rate for a given producer
   * 5. Base cost multiplier - a multiplier to the base cost of a given producer
   */
  function handleBuy() {
    $upgradeStore[idx].purchased = true

    // Iterate and apply the effects of the upgrade
    Object.keys(effects).forEach((effect) => {
      switch (effect) {
        case 'milkPerClickMultiplier':
          $generalStore.milkPerClick *= effects.milkPerClickMultiplier
          break
        case 'globalMultiplier':
          $generalStore.globalMultiplier *= effects.globalMultiplier
          break
        case 'producerMultiplier':
          Object.entries(effects.producerMultiplier).forEach(([producerName, multiplier]) => {
            getProducer(producerName).productionRate *= multiplier
          })
          break
        case 'baseProductionRate':
          Object.entries(effects.baseProductionRate).forEach(([producerName, rate]) => {
            getProducer(producerName).baseProductionRate = rate
          })
          break
        case 'baseCostMultiplier':
          Object.entries(effects.baseCostMultiplier).forEach(([producerName, costMultiplier]) => {
            getProducer(producerName).baseCost *= costMultiplier
          })
          break
      }
    })

    // Reflect upgrades on producers immediately
    producerStore.set($producerStore)
  }
</script>

<button
  class='wrapper'
  disabled={!canAfford}
  style={`display: ${($upgradeStore[idx].unlocked && !$upgradeStore[idx].purchased) ? 'block;' : 'none;'}`}
  on:click={handleBuy}
>
  <h4>{name} ({formatVolume(price)})</h4>
  <p>{description}</p>
</button>

<style lang='scss'>
  .wrapper {
    padding: 1em;
    text-align: left;
    cursor: pointer;
    width: 100%;

    &:disabled {
      cursor: default;
    }

    h4 {
      margin: 0;
    }
    p {
      margin-block: .5em .25em;
    }
  }
</style>