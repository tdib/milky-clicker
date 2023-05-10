<script>
  import upgradeStore from '../../stores/upgradeStore'
  import { formatVolume } from '$lib/util/numberFormatter'
  export let id = -1
  export let name = 'Upgrade Name'
  export let description = 'Upgrade Description'
  export let effect = ""
  export let preconditions = []
  export let price = 0

  // Unlocked = all preconditions met
  let unlocked = false
  preconditions.forEach((precondition) => {
    try {
      if (eval(precondition)) {

      } else {
        console.log(name, 'LOCKED');
      }
    } catch {
      console.log('BOW BOW');
    }
  })
</script>

<h5>{name} ({formatVolume(price)})</h5>
<p>{description}</p>

<style>
  h5 {
    margin: 0;
  }
  p {
    margin-block: .5em 2em;
  }
</style>