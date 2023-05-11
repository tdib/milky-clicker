<script>
  import { onMount } from 'svelte'
  import producers from '$lib/data/producers.json'
  import upgrades from '$lib/data/upgrades.json'
  import Producer from '$lib/components/Producer.svelte'
  import Upgrade from '$lib/components/Upgrade.svelte'
  import { formatVolume } from '$lib/util/numberFormatter'
  import glug from '$lib/assets/glug.mp3'

  import generalStore from '../stores/generalStore'
  import producerStore from '../stores/producerStore'
  import upgradeStore from '../stores/upgradeStore'
  import { milkPerSecond } from '../stores/milkPerSecondStore'

  // Dynamically select milk image
  let clickImg
  $: import(`$lib/assets/bottles/${$generalStore.style}/tier${$generalStore.tier}.png`)
    .then((module) => { clickImg = module.default })
    .catch((error) => { console.warn(error) })


  // Handle milk tier upgrades
  $: if ($generalStore.allTimeMilk >= 10000000) {
      $generalStore.tier = 3
      generalStore.set($generalStore)
    } else if ($generalStore.allTimeMilk >= 1000) {
      $generalStore.tier = 2
      generalStore.set($generalStore)
    }

  /**
   * Game tick functionality - increments the amount of milk
   * according to the milk per second, creates a smooth value
   * transition rather than jumping
   */
  let lastTime = null
  function incrementMilk(timeStamp) {
    if (!lastTime) lastTime = timeStamp
    const elapsed = timeStamp - lastTime
    // Compute how much milk would have been generated since last tick
    // console.log('incrementing with ', $milkPerSecond);
    const increment = ($milkPerSecond * elapsed / 1000) * $generalStore.globalMultiplier
    if (increment !== 0) {
      generalStore.update((s) => ({
        ...s,
        milk: $generalStore.milk + increment,
        allTimeMilk: $generalStore.allTimeMilk + increment
      }))
    }
    lastTime = timeStamp
    requestAnimationFrame(incrementMilk)
  }

  onMount(() => {
    producers.forEach((producer) => {
      producer['numOwned'] = 0
      producer['multiplier'] = 1
    })
    producerStore.set(producers)

    upgrades.forEach((upgrade) => {
      upgrade['unlocked'] = false
      upgrade['purchased'] = false
    })
    upgradeStore.set(upgrades)

    requestAnimationFrame(incrementMilk)
  })


  /**
   * Milk click functionality - increments milk amount based off your
   * milkPerClick value.
   * 
   * @param power a multiplier for your milkPerClick value
   */
  function milkClickFn(power) {
    generalStore.update((s) => ({
      ...s,
      milk: $generalStore.milk + $generalStore.milkPerClick * $generalStore.globalMultiplier * power,
      allTimeMilk: $generalStore.allTimeMilk + $generalStore.milkPerClick * $generalStore.globalMultiplier * power,
      numClicks: $generalStore.numClicks + 1
    }))

    // #HACK Allows immediate unlocks of tier 2/3 upgrade when using dev 1TL milk gen - not sure why this allows the upgrades to show immediately
    producerStore.set($producerStore)

    let glugAudio = new Audio(glug)
    glugAudio.play()
  }
</script>


<div class='wrapper'>
  <div class='clicker-section'>
    <div class='milk-counter'>
      {#if $generalStore.milk === 0}
        You have no milk :(
      {:else}
        {formatVolume($generalStore.milk, false)}
      {/if}
    </div>

    <p>(earning {formatVolume($milkPerSecond * $generalStore.globalMultiplier)} milk per second)</p>

    <button on:click={() => milkClickFn(1)}>
      <img src={clickImg} alt={'A delicious containment unit of the finest milk'} class='milk-img'>
    </button>

    <label for='style'>Art style:</label>
    <select id='style' bind:value={$generalStore.style}>
      <option value='dib'>Dib</option>
      <option value='ewan'>Ewan</option>
      <option value='ai'>Dalle 2</option>
    </select>

    <div class='stats'>
      <h3>Statistics:</h3>
      <p>All time milk: {formatVolume($generalStore.allTimeMilk, false)}</p>
      <p>Milk per click: {formatVolume($generalStore.milkPerClick * $generalStore.globalMultiplier)}</p>
      <p>Global multiplier: {$generalStore.globalMultiplier}</p>
      <p>All time clicks: {$generalStore.numClicks}</p>
    </div>

    <div class='dev'>
      <h3>Super top secret dev buttons</h3>
      <button on:click={() => milkClickFn(1)}>Generate 1 Millilitre</button>
      <button on:click={() => milkClickFn(10)}>Generate 10 Millilitres</button>
      <button on:click={() => milkClickFn(1000)}>Generate 1 Litre</button>
      <button on:click={() => milkClickFn(1000000)}>Generate 1 Kilolitre</button>
      <button on:click={() => milkClickFn(1000000000)}>Generate 1 Megalitre</button>
      <button on:click={() => milkClickFn(1000000000000)}>Generate 1 Gigalitre</button>
      <button on:click={() => milkClickFn(1000000000000000)}>Generate 1 Teralitre</button>
    </div>
  </div>

  <div class='upgrades-section'>
    {#each $upgradeStore as upgrade}
      <Upgrade id={upgrade.id}></Upgrade>
    {/each}

    <hr>

    <h3>Purchased Upgrades:</h3>
    {#each $upgradeStore as upgrade}
      {#if upgrade.purchased}
        <div class='purchased'>
          <h4>{upgrade.name}</h4>
          <p>{upgrade.description}</p>
        </div>
      {/if}
    {/each}
  </div>

  <div class='producers'>
    {#each $producerStore as _, idx}
      <Producer idx={idx}></Producer>
    {/each}
  </div>
</div>


<style lang='scss'>
  .wrapper {
    margin: 1em;
    display: flex;
    gap: 2em;

    .clicker-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 30%;

      .milk-counter {
        font-size: 2em;
        font-weight: bold;
        text-align: center;
        margin: 0;
        padding: 0;
        margin-block-start: .75em;
      }


      button {
        cursor: pointer;
        width: 100%;
        background: none;
        outline: none;
        border: none;

        .milk-img {
          width: 100%;
          max-width: 25em;

          &:hover {
            scale: 1.05;
          }

          &:active {
            scale: 0.95;
          }
        }
      }

      .stats {
        width: 100%;

        p {
          padding: 0;
          margin-block: .75em;
        }
      }

      .dev {
        button {
          border-radius: 1em;
          border: 2px solid rgb(76, 154, 77);
          padding: 1em;
          background-color: rgb(141, 204, 122);
          margin-block-end: .25em;
          
        }
      }
    }


    .upgrades-section {
      flex: 1;

      .purchased {
        font-size: 0.7em;
        border: 2px solid black;
        padding: 1em;
        border-radius: .25em;
        margin-block-end: 1em;

        h4 {
          padding: 0;
          margin: 0;
        }
      }
    }

    .producers {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }
  }
</style>