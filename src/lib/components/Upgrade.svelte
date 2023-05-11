<script>
  import producerStore from '../../stores/producerStore'
  import upgradeStore from '../../stores/upgradeStore'
  import generalStore from '../../stores/generalStore'
  import { formatVolume } from '$lib/util/numberFormatter'
  export let id
  // export let name = 'Upgrade Name'
  // export let description = 'Upgrade Description'
  // export let effect = ""
  // export let preconditions = []
  // export let price = 0

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


  // $: console.log('upgrades have changed!', $upgradeStore);

  // Compute whether the upgrade is unlocked (i.e. visible to the user)
  $: $upgradeStore[idx].unlocked = preconditions.every((precondition) => {
    $producerStore
    // TODO: make preconditions unlock properly - e.g. high lactation cows doesn't unlock immediately
    console.log(`checking precondition for ${name}: ${precondition}`);
    try {
      if (!!eval(precondition)) {
        return true
      }
    } catch (e) {
      console.warn('???', name, e);
    }
    return false
  })

  function handleBuy() {
    // console.log('buying', name, $upgradeStore[idx]);
    // upgradeStore.
    $upgradeStore[idx].purchased = true
    try {
      console.log('effect', effect);
      eval(effect)
      generalStore.set($generalStore)
      producerStore.set($producerStore)
      console.log('success!');
      console.log('getting cow', getProducer('Cow'))
    } catch (error) {
      console.warn("ahh", name, error);
    }
  }

  $: console.log("BASE PRODUCTION UPGRADED", getProducer('Cow'));


  // let unlocked = false
  // upgradeStore.update((upgrades) => {
  //   console.log("updating", name, upgrades[idx]);
  //   upgrades[idx].unlocked = unlocked
  //   return upgrades
  // })

  // $: console.log(`${id} ${idx} ${$upgradeStore[idx].name} unlocked: ${$upgradeStore[idx].unlocked}`);
</script>

<button
  class='wrapper'
  disabled={!canAfford}
  style={`display: ${($upgradeStore[idx].unlocked && !$upgradeStore[idx].purchased) ? 'block;' : 'none;'}`}
  on:click={handleBuy}
>
  <h5>{name} ({formatVolume(price)})</h5>
  <p>{description}</p>
</button>

<style lang='scss'>

  .wrapper {
    text-align: left;

    h5 {
      margin: 0;
    }
    p {
      margin-block: .5em 2em;
    }
  }
</style>