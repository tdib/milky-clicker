<script>
  import { formatVolume } from '$lib/util/numberFormatter'
  import generalStore from '../../stores/generalStore'
  import producerStore from '../../stores/producerStore'

  // Link instance of producer to producerStore
  export let idx = -1

  // Dynamically set image according to the selected style
  let imgSrc
  $: import(`$lib/assets/producers/${$generalStore.style}/${$producerStore[idx].name.toLowerCase().replaceAll(' ', '-')}.png`)
    .then((module) => { imgSrc = module.default })
    .catch((error) => { console.log(error) })

  $: cost = $producerStore[idx].baseCost * (1.15 ** $producerStore[idx].numOwned)
  $: canAfford = $generalStore.milk >= cost

  function handleBuy() {
    generalStore.update((s) => ({
      ...s,
      milk: $generalStore.milk - cost,
    }))

    $producerStore[idx].numOwned++
  }
</script>

<button disabled={!canAfford} on:click={handleBuy}>
  <img src={imgSrc} alt={`High quality image of ${$producerStore[idx].name}`}>

  <div>
    <div class='header-line'>
      <h2>{$producerStore[idx].name}</h2>
      <span>(Cost: {formatVolume(cost)})</span>
    </div>
    <p>{$producerStore[idx].description}</p>
    <p>Generates {formatVolume($producerStore[idx].baseProductionRate)}/s</p>
    <p>You own {$producerStore[idx].numOwned} {$producerStore[idx].name}{$producerStore[idx].name.endsWith('s') || $producerStore[idx].numOwned === 1 ? '': 's'}</p>
  </div>
</button>

<style lang='scss'>
  button {
    border: 2px solid black;
    padding: 1em;
    font-size: .9em;
    text-align: left;
    width: 100%;
    display: flex;

    &:hover {
      cursor: pointer;
    }

    &:disabled {
      background-color: red;
    }

    img {
      width: 30%;
      padding-inline-end: 1em;;
    }


    .header-line {
      display: flex;
      align-items: center;
    }

    h2 {
      padding-inline-end: .5em;
      margin: 0;
    }

    p {
      margin-block: .25em;
    }

  }

</style>