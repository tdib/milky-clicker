<script>
  import { onMount } from 'svelte'
  import { formatVolume } from '$lib/util/numberFormatter.js'

  let milkPerClick = 1
  let milkPerSecond = 0
  let milk = 0

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
    const increment = milkPerSecond * elapsed / 1000
    // store.update((store) => ({ ...store, milk: store.milk + increment}))
    if (increment !== 0) {
      milk += increment
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
    milk += milkPerClick * power
  }
</script>

{#if milk === 0}
  <p>You currently have no milk</p>
{:else}
  <p>You currently have {formatVolume(milk)} of milk</p>
{/if}

<p>You are earning {formatVolume(milkPerSecond)} milk per second.</p>

<button on:click={() => milkClickFn(1)}>Milk</button>
<button on:click={() => milkClickFn(2)}>Milk x2</button>
<button on:click={() => milkClickFn(5)}>Milk x5</button>
<button on:click={() => milkClickFn(10)}>Milk x10</button>
<button on:click={() => milkClickFn(100)}>Milk x100</button>
<button on:click={() => milkPerSecond += 1}>+1 mps</button>
<button on:click={() => milkPerSecond += 100}>+100 mps</button>
<button on:click={() => milkPerSecond += 1000}>+1000 mps</button>
<button on:click={() => milkPerSecond += 100000}>+100000 mps</button>
<button on:click={() => milkPerSecond += 10000000}>+1000000 mps</button>999999