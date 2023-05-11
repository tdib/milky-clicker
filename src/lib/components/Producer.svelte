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
    .catch((error) => { console.warn(error) })

  $: cost = $producerStore[idx].baseCost * (1.15 ** $producerStore[idx].numOwned)
  $: canAfford = $generalStore.milk >= cost
  $: singleProductionRate = $producerStore[idx].baseProductionRate * $producerStore[idx].multiplier * $generalStore.globalMultiplier
  $: totalProductionRate = $producerStore[idx].numOwned === 0 ? 0 : singleProductionRate * $producerStore[idx].numOwned
  
  let unlocked = $producerStore[idx].unlocked
  $: if (!unlocked) unlocked = $generalStore.milk >= cost * 0.80

  function handleBuy() {
    generalStore.update((s) => ({
      ...s,
      milk: $generalStore.milk - cost,
    }))

    $producerStore[idx].numOwned++
  }
</script>

{#if unlocked}
  <button disabled={!canAfford} on:click={handleBuy}>
    <div class='producer-left'>
      <img src={imgSrc} alt={`High quality image of ${$producerStore[idx].name}`}>
      Owned: {$producerStore[idx].numOwned}
    </div>

    <div>
      <h2>{$producerStore[idx].name}</h2>
      <p>(Cost: {formatVolume(cost)})</p>
      <p>(Each Unit Produces: {formatVolume(singleProductionRate)}/s)</p>
      <p>(Total Production: {totalProductionRate === 0 ? 'N/A' : `${formatVolume(totalProductionRate)}/s`})</p>
      <p class='description'>{$producerStore[idx].description}</p>
    </div>
  </button>
{/if}

<style lang='scss'>
  button {
    background-color: rgb(138, 143, 164);
    border: none;
    padding: 1em;
    font-size: .9em;
    text-align: left;
    width: 100%;
    display: flex;
    max-width: 35em;
    border-radius: .5em;

    .producer-left {
      display: flex;
      flex-direction: column;
      text-align: center;
      width: 20%;
      margin-inline-end: 1em;

      img {
        margin-block-end: 1em;
        border-radius: .25em;
      }
    }

    .description {
      margin-block-start: 1em;
    }

    &:hover {
      cursor: pointer;

      &:not(:disabled) {
        filter: brightness(0.98);
      }
    }

    &:disabled {
      img {
        filter: grayscale(100%);
        opacity: 0.5;
      }
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