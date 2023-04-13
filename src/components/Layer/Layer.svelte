<svelte:body
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
  on:mousemove={handleMouseMove}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
/>

<div
  class="container"
  bind:clientWidth={width}
  bind:clientHeight={height}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  style={`cursor:${mouseState.cursor}`}
>
  <div class="panAndZoom" style={`
    transform:${containerTransform};
    pointer-events:${mouseState.mode === 'default' ? 'all' : 'none'}
  `}>
    <slot props={propsInner}/>
  </div>
</div>

<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let width = 0;
export let height = 0;

export let keyBindings = {
  pan: ' ',
};

type KeyBindings = typeof keyBindings;

$: propsInner = {
  width,
  height,
};

let oldWidth = 0;
let oldHeight = 0;
interface DimChangedEvent {
  detail: {
    width: number;
    height: number;
  };
}
const dispatch = createEventDispatcher<DimChangedEvent>();

$: if(oldWidth !== width || oldHeight !== height) {
  oldWidth = width;
  oldHeight = height;
  dispatch('dimChanged', {width, height});
}

interface MouseState {
  mouseEntered: boolean;
  mode: 'default' | 'pan' | 'zoom' | 'rotate';
  cursor: 'default' | 'grab' | 'grabbing';
  panning: boolean;
  current: [number, number];
  anchor: [number, number];
  delta: [number, number];
}

// mouseState as MouseState
$: mouseState = {
  // Current state
  mouseEntered: false,
  mode: 'default',
  cursor: 'default',
  panning: false,

  // Mouse position
  current: [0, 0],
  anchor: [0, 0],
  delta: [0, 0],
}

$: containerState = {
  pan: [0, 0],
}

let containerTransform = '';

const handleMouseEnter = () => {
  mouseState.mouseEntered = true;
}

const handleMouseLeave = () => {
  mouseState.mouseEntered = false;
}

const handleMouseMove = (event) => {
  // Get current mouse position
  const { clientX, clientY } = event;
  mouseState.current = [clientX, clientY];
  mouseState.delta = [clientX - mouseState.anchor[0], clientY - mouseState.anchor[1]];

  // log mouseState
  // console.log(JSON.stringify(mouseState));
  if(mouseState.panning === true) {
    containerTransform = `translate3d(${containerState.pan[0] + mouseState.delta[0]}px, ${containerState.pan[1] + mouseState.delta[1]}px, 0)`;
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if(mouseState.mouseEntered === false) return;
  if(event.key) {
    event.preventDefault();
    event.stopPropagation();
    // dispatch('escape');
    console.log(`[Keydown] ${event.key}`);

    switch(event.key as KeyBindings) {
      case keyBindings.pan:
        if(mouseState.mode === 'pan') return;
        mouseState.mode = 'pan';
        mouseState.cursor = 'grab';
        break;
    }
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  switch(event.key as KeyBindings) {
    case keyBindings.pan:
      mouseState.mode = 'default';
      mouseState.cursor = 'default';
      mouseState.panning = false;
      break;
  }
};

const handleMouseDown = (event) => {
  const button = event.button;
  if(button === 0 && mouseState.mode === 'pan') {
    // Left click
    mouseState.panning = true;
    mouseState.cursor = 'grabbing';
    mouseState.anchor = [...mouseState.current];
  }
}

const handleMouseUp = (event) => {
  const button = event.button;
  if(button === 0 && mouseState.mode === 'pan') {
    // Left click
    mouseState.panning = false;
    mouseState.cursor = 'grab';
    containerState.pan = [
      containerState.pan[0] + mouseState.delta[0],
      containerState.pan[1] + mouseState.delta[1],
    ];
  }
}
</script>

<style lang="scss">
.container {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;

  overflow: hidden;
  contain: strict;
}

.panAndZoom {
  position: relative;
  width: 100%;
  height: 100%;
}

.container :global(.layer) {
  &:first-child {
    position: relative;
  }
  &:not(:first-child) {
    position: absolute;
  }
  top: 0;
  left: 0;
  box-sizing: border-box;
  resize: none;
  overflow: visible;

  width: 100%;
  height: 100%;
}

</style>