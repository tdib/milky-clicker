<script>
  import { onMount } from 'svelte'
  import producers from '$lib/data/producers.json'
  import Producer from '$lib/components/Producer.svelte'
  import { formatVolume } from '$lib/util/numberFormatter.js'
  import store from '../stores/globalStore.js'

  // Dynamically select milk image
  let clickImg
  $: import(`$lib/assets/bottles/${$store.style}/tier${$store.tier}.png`)
    .then((module) => { clickImg = module.default })
    .catch((error) => { console.log(error) })

  // Handle milk tier upgrades
  $: if ($store.allTimeMilk >= 1000) {
    $store.tier = 2
  } else if ($store.allTimeMilk >= 100000) {
    $store.tier = 3
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
    const increment = $store.milkPerSecond * elapsed / 1000
    // store.update((store) => ({ ...store, milk: store.milk + increment}))
    if (increment !== 0) {
      // store.milk += increment
      store.update((s) => ({
        ...s,
        milk: $store.milk + increment,
        allTimeMilk: $store.allTimeMilk + increment
      }))
    }
    lastTime = timeStamp
    requestAnimationFrame(incrementMilk)
  }
  onMount(() => {
    requestAnimationFrame(incrementMilk)
  })

  /**
   * Milk click functionality - increments milk amount based off your
   * milkPerClick value.
   * 
   * @param power a multiplier for your milkPerClick value
   */
  function milkClickFn(power) {
    store.update((s) => ({
      ...s,
      milk: $store.milk + $store.milkPerClick * power,
      allTimeMilk: $store.allTimeMilk + $store.milkPerClick * power
    }))
  }




</script>


<div class='wrapper'>
  <div class='clicker'>
    {#if $store.milk === 0}
      <p>You currently have no milk</p>
    {:else}
      <p>You currently have {formatVolume($store.milk)} of milk</p>
    {/if}

    <p>You are earning {formatVolume($store.milkPerSecond)} milk per second.</p>

    <button on:click={() => milkClickFn(1)} >
      <img src={clickImg} alt={'A delicious containment unit of the finest milk'}>
    </button>

    <button on:click={() => milkClickFn(1)}>Milk</button>
    <button on:click={() => milkClickFn(2)}>Milk x2</button>
    <button on:click={() => milkClickFn(5)}>Milk x5</button>
    <button on:click={() => milkClickFn(10)}>Milk x10</button>
    <button on:click={() => milkClickFn(100)}>Milk x100</button>
    <button on:click={() => $store.milkPerSecond += 1}>+1 mps</button>
    <button on:click={() => $store.milkPerSecond += 100}>+100 mps</button>
    <button on:click={() => $store.milkPerSecond += 1000}>+1000 mps</button>
    <button on:click={() => $store.milkPerSecond += 100000}>+100000 mps</button>
    <button on:click={() => $store.milkPerSecond += 1000000}>+1000000 mps</button>
  </div>

  <div class='upgrades'>

  </div>

  <div class='producers'>
    {#each producers as producer}
      <Producer {...producer}></Producer>
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
    }

    .producers {
      width: 50%;
      display: flex;
      flex-direction: column;
    }
  }
</style>