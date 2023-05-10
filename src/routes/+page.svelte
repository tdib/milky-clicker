<script>
  import { onMount } from 'svelte'
  import producers from '$lib/data/producers.json'
  import upgrades from '$lib/data/upgrades.json'
  import Producer from '$lib/components/Producer.svelte'
  import Upgrade from '$lib/components/Upgrade.svelte'
  import { formatVolume } from '$lib/util/numberFormatter'

  import generalStore from '../stores/generalStore'
  import producerStore from '../stores/producerStore'
  import upgradeStore from '../stores/upgradeStore'
  import { milkPerSecond } from '../stores/milkPerSecondStore'

  // Dynamically select milk image
  let clickImg
  $: import(`$lib/assets/bottles/${$generalStore.style}/tier${$generalStore.tier}.png`)
    .then((module) => { clickImg = module.default })
    .catch((error) => { console.log(error) })

  // Handle milk tier upgrades
  // $: if ($generalStore.allTimeMilk >= 1000) {
  //   $generalStore.tier = 2
  // } else if ($generalStore.allTimeMilk >= 100000) {
  //   $generalStore.tier = 3
  // }

  // $: console.log('milkps', $milkPerSecond);
  // $: console.log('PROD STOORE', $producerStore);
  // $: console.log('general milk', $generalStore.milk);


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
    const increment = $milkPerSecond * elapsed / 1000
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
      // producer['cost'] = 1
      // producer['canAfford'] = false
    })
    producerStore.set(producers)

    upgradeStore.set(upgrades)
    // $upgradeStore.forEach((upgrade) => {
    // })
    requestAnimationFrame(incrementMilk)

  })

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
      milk: $generalStore.milk + $generalStore.milkPerClick * power,
      allTimeMilk: $generalStore.allTimeMilk + $generalStore.milkPerClick * power
    }))
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

    <button on:click={() => milkClickFn(1)} >
      <img src={clickImg} alt={'A delicious containment unit of the finest milk'}>
    </button>

    <button on:click={() => milkClickFn(1)}>Milk</button>
    <button on:click={() => milkClickFn(2)}>Milk x2</button>
    <button on:click={() => milkClickFn(5)}>Milk x5</button>
    <button on:click={() => milkClickFn(10)}>Milk x10</button>
    <button on:click={() => milkClickFn(100)}>Milk x100</button>
    <button on:click={() => $milkPerSecond += 1}>+1 mps</button>
    <button on:click={() => $milkPerSecond += 100}>+100 mps</button>
    <button on:click={() => $milkPerSecond += 1000}>+1000 mps</button>
    <button on:click={() => $milkPerSecond += 100000}>+100000 mps</button>
    <button on:click={() => $milkPerSecond += 1000000}>+1000000 mps</button>
  </div>

  <div class='upgrades'>
    {#each $upgradeStore as upgrade}
      <Upgrade {...upgrade}></Upgrade>
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
    }

    .producers {
      width: 50%;
      display: flex;
      flex-direction: column;
    }
  }
</style>