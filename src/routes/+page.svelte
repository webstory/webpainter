<h1>Layers!!</h1>
<div class="layer">
<Layer on:dimChanged={onLayerDimChanged} bind:width={layerWidth} bind:height={layerHeight}>
  {#each items as layer, index}
    <div class="layer" style={cssStringify(layer.style)}>{@html layer.content}</div>
  {/each}
  <div class="layer"><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p></div>
</Layer>
</div>

<div>
<p>widht: {layerProps.width}</p>
<p>height: {layerProps.height}</p>
<p>width: {layerWidth}</p>
<p>height: {layerHeight}</p>
</div>

<FancyList {items} let:prop2={thing}>
  <div>{thing.text}+1</div>
  <div>{thing.text}+2</div>
</FancyList>

<script lang="ts">
import { Layer } from "@components/Layer";
import FancyList from "@components/FancyList.svelte";

import { cssStringify } from '@utils';

let layerProps = {width: 0, height: 0};
const onLayerDimChanged = (event) => {
  layerProps = event.detail;
};

let layerWidth = 0;
let layerHeight = 0;

const items = [
  {
    type: "canvas",
    content: [],
    text: "1",
  },
  {
    type: "div",
    content: `<h1>Hello World</h1>`,
    text: "2",
    style: {width: 1024, height: 768},
  },
  {
    type: "div",
    content: `<h1>Hi my name is</h1>`,
    text: "3",
  },
  {
    type: "div",
    content: `<h1>Oops</h1>`,
    text: "4",
  }

];

console.log(cssStringify({width: 1024, height: 768}));

</script>

<style lang="scss">
.layer {
  width: 100%;
  height: 600px;
  min-height: 500px;
  border: 1px solid black;
  // resize: both;
  // overflow: auto;
  // padding: 10px;
}
</style>