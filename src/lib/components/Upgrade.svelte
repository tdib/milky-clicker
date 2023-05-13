<script>
  import producerStore from '../../stores/producerStore'
  import upgradeStore from '../../stores/upgradeStore'
  import generalStore from '../../stores/generalStore'
  import { formatVolume } from '$lib/util/numberFormatter'

  export let id
  let idx = $upgradeStore.findIndex((upgrade) => upgrade.id === id)
  const { name, description, effect, preconditions, price } = $upgradeStore[idx]

  $: canAfford = $generalStore.milk >= price

  function getProducer(name) {
    return $producerStore.find((producer) => producer.name.toLowerCase() === name.toLowerCase())
  }

  function ownsProducer(name, quantity=1) {
    return getProducer(name).numOwned >= quantity
  }

  function ownsUpgrade(id) {
    return $upgradeStore.find((upgrade) => upgrade.id === id).purchased
  }

  function hasTier(tier) {
    return $generalStore.tier >= tier
  }

  /**
   * Rewrites any function calls for ownsProducer/ownsUpgrade/hasTier/etc to use the correct function
   * This is so it can handle the function names being minified
   */
  function rewriteCall(call) {
    const rewrites = {
      "getProducer": getProducer.name,
      "ownsProducer": ownsProducer.name,
      "ownsUpgrade": ownsUpgrade.name,
      "hasTier": hasTier.name
    }
    return Object
            .entries(rewrites)
            .reduce((output, [orig, func]) => output.replaceAll(orig, func), call)
  }

  // Compute whether the upgrade is unlocked (i.e. visible to the user)
  $: $upgradeStore[idx].unlocked = preconditions.every((precondition) => {
    $producerStore
    try {
      if (!!eval(rewriteCall(precondition))) {
        return true
      }
    } catch (e) {
    }
    return false
  })

  function handleBuy() {
    $upgradeStore[idx].purchased = true
    try {
      eval(rewriteCall(effect))
      generalStore.set($generalStore)
      producerStore.set($producerStore)
    } catch (error) {
      console.warn("ahh", name, error);
    }
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