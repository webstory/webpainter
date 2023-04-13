<!-- FancyList.svelte -->
<ul>
  {#each items as item}
    <li class="fancy">
      <slot prop2={item}></slot>
    </li>
  {/each}
</ul>

<script lang="ts">
  export let items = [];
</script>

<style>
.fancy {
  color: red;
}
</style>