<script>
  import { formatVolume } from '$lib/util/numberFormatter.js'
  import store from '../../stores/globalStore.js'

  export let name = 'Producer name'
  export let description = 'Lorem ipsum'
  export let baseCost = 0
  export let productionRate = 0
  export let numOwned = 0

  let imgSrc
  import(`$lib/assets/producers/${$store.style}/${name.toLowerCase().replaceAll(' ', '-')}.png`)
    .then((module) => { imgSrc = module.default })
    .catch((error) => { console.log(error) })

  $: cost = baseCost * (1.15 ** numOwned)
  $: canAfford = $store.milk >= cost

  function handleBuy() {
    store.update((s) => ({
      ...s,
      milk: $store.milk - cost,
      milkPerSecond: $store.milkPerSecond + productionRate
    }))
    numOwned++
  }
</script>

<button disabled={!canAfford} on:click={handleBuy}>
  <img src={imgSrc} alt={`High quality image of ${name}`}>

  <div>
    <div class='header-line'>
      <h2>{name}</h2>
      <span>(Cost: {formatVolume(cost)})</span>
    </div>
    <p>{description}</p>
    <p>Generates {formatVolume(productionRate)}/s</p>
    <p>You own {numOwned} {name}{name.endsWith('s') || numOwned === 1 ? '': 's'}</p>
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