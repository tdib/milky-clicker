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
  $: if ($generalStore.allTimeMilk >= 100000) {
      $generalStore.tier = 3
    } else if ($generalStore.allTimeMilk >= 1000) {
      $generalStore.tier = 2
    }

  $: console.log('upgrade chanrge', $upgradeStore);


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
    // console.log('increment is', increment);
    // store.update((store) => ({ ...store, milk: store.milk + increment}))
    if (increment !== 0) {
      // store.milk += increment
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

  $: console.log($generalStore.style);

  // $: console.log('producerstore', $producerStore);
  // $: console.log('generalStore', $generalStore);

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
      allTimeMilk: $generalStore.allTimeMilk + $generalStore.milkPerClick * $generalStore.globalMultiplier * power
    }))

    let glugAudio = new Audio(glug)
    glugAudio.play()
  }
</script>


<div class='wrapper'>
  <div class='clicker'>
    {#if $generalStore.milk === 0}
      <p>You currently have no milk</p>
    {:else}
      <p>You currently have {formatVolume($generalStore.milk)} of milk</p>
    {/if}

    <p>You are earning {formatVolume($milkPerSecond)} milk per second.</p>
    <p>Each click will earn you {formatVolume($generalStore.milkPerClick * $generalStore.globalMultiplier)}.</p>
    <p>Your global multiplier is {$generalStore.globalMultiplier}</p>

    <button on:click={() => milkClickFn(1)} >
      <img src={clickImg} alt={'A delicious containment unit of the finest milk'}>
    </button>

    <label for='style'>Art style:</label>
    <select id='style' bind:value={$generalStore.style}>
      <option value='dib'>Dib</option>
      <option value='ewan'>Ewan</option>
    </select>

    <h3>Super top secret dev buttons</h3>
    <button on:click={() => milkClickFn(1)}>1 Millilitre</button>
    <button on:click={() => milkClickFn(10)}>10 Millilitres</button>
    <button on:click={() => milkClickFn(1000)}>1 Litre</button>
    <button on:click={() => milkClickFn(1000000)}>1 Kilolitre</button>
    <button on:click={() => milkClickFn(1000000000)}>1 Megalitre</button>
    <button on:click={() => milkClickFn(1000000000000)}>1 Gigalitre</button>
    <button on:click={() => milkClickFn(1000000000000000)}>1 Teralitre</button>
  </div>

  <div class='upgrades'>
    {#each $upgradeStore as upgrade}
      <Upgrade id={upgrade.id}></Upgrade>
    {/each}

    <hr>

    <p>Purchased:</p>
    {#each $upgradeStore as upgrade}
      {#if upgrade.purchased}
        <div class='purchased'>
          <h5>{upgrade.name}</h5>
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
    display: flex;

    .clicker {
      width: 30%;

      button {
        cursor: pointer;
        width: 100%;
        background: none;
        outline: none;
        border: none;

        img {
          width: 100%;

          &:hover {
            scale: 1.05;
          }

          &:active {
            scale: 0.95;
          }
        }
      }
    }

    .upgrades {
      flex: 1;

      .purchased {
        font-size: 0.7em;
        border: 2px solid black;

        h5, p {
          padding: 0;
          margin: 0;
        }
      }
    }

    .producers {
      width: 50%;
      display: flex;
      flex-direction: column;
    }
  }
</style>