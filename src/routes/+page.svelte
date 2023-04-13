<script lang="ts">
  import { Layer } from '@components/Layer';

  import { cssStringify } from '@utils';

  // import testImg from '$lib/images/4430563_Fuf_egguhuntib.png';
  const testImg = 'https://images.mirma.cc/4430563_Fuf_egguhuntib.png';

  let layerProps = { width: 0, height: 0 };
  const onLayerDimChanged = (event) => {
    layerProps = event.detail;
  };

  let layerWidth = 0;
  let layerHeight = 0;

  const items = [
    {
      type: 'canvas',
      content: [],
      text: '1',
    },
    {
      type: 'div',
      content: `<h1>Hello World</h1>`,
      text: '2',
      style: { width: 1024, height: 768 },
    },
    {
      type: 'div',
      content: `<h1>Hi my name is</h1>`,
      text: '3',
    },
    {
      type: 'div',
      content: `<h1>Oops</h1>`,
      text: '4',
    },
  ];
</script>

<h1>Layers!!</h1>
<div class="layer-container">
  <Layer on:dimChanged={onLayerDimChanged} bind:width={layerWidth} bind:height={layerHeight}>
    <div class="layer">
      <picture>
        <source srcset={testImg} />
        <img src="https://images.mirma.cc/4430563_Fuf_egguhuntib.png" alt="picture" />
      </picture>
    </div>
    {#each items as layer, index}
      <div class="layer" style={cssStringify(layer.style)}>{@html layer.content}</div>
    {/each}
    <div class="layer">
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
        when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
        into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
        passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </p>
    </div>
  </Layer>
</div>

<div>
  <p>widht: {layerProps.width}</p>
  <p>height: {layerProps.height}</p>
  <p>width: {layerWidth}</p>
  <p>height: {layerHeight}</p>
</div>

<style lang="scss">
  .layer-container {
    width: 100%;
    height: 600px;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .layer {
    border: 1px dashed black;
    // resize: both;
    // overflow: auto;
    // padding: 10px;
  }
</style>
