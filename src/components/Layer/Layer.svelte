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

  $: if (oldWidth !== width || oldHeight !== height) {
    oldWidth = width;
    oldHeight = height;
    dispatch('viewportDimChanged', { width, height });
  }

  type BroadcastEvent = MouseEvent | KeyboardEvent;

  const dispatchBroadcast = createEventDispatcher<BroadcastEvent>();

  const broadcast = (eventName: string, event: BroadcastEvent) => {
    console.log('Broadcasting event: ', eventName, event);
    const eventWrapper = { detail: event.detail, type: eventName };
    if (/^mouse/.test(eventName)) {
      eventWrapper.detail = {
        ...event.detail,
        clientX: event.clientX,
        clientY: event.clientY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
      };
    } else if (/^key/.test(eventName)) {
      eventWrapper.detail = {
        ...event.detail,
        key: event.key,
        code: event.code,
        location: event.location,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        repeat: event.repeat,
        isComposing: event.isComposing,
        charCode: event.charCode,
        keyCode: event.keyCode,
        which: event.which,
      };
    }
    dispatchBroadcast('broadcast', eventWrapper);
  };

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
  };

  $: containerState = {
    pan: [0, 0],
    scale: 1.0,
  };

  let containerTransform = '';

  const handleMouseEnter = () => {
    mouseState.mouseEntered = true;
  };

  const handleMouseLeave = () => {
    mouseState.mouseEntered = false;
  };

  const handleMouseMove = (event) => {
    // Get current mouse position
    const { clientX, clientY } = event;
    mouseState.current = [clientX, clientY];
    mouseState.delta = [clientX - mouseState.anchor[0], clientY - mouseState.anchor[1]];

    // log mouseState
    // console.log(JSON.stringify(mouseState));
    if (mouseState.panning === true) {
      // Adjust panning distance by container scale factor
      const pan = [containerState.pan[0] + mouseState.delta[0] / containerState.scale, containerState.pan[1] + mouseState.delta[1] / containerState.scale];
      containerTransform = `translate3d(${pan[0]}px, ${pan[1]}px, 0)`;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (mouseState.mouseEntered === false) return;
    if (event.key) {
      event.preventDefault();
      event.stopPropagation();
      // dispatch('escape');
      console.log(`[Keydown] ${event.key}`);

      switch (event.key as KeyBindings) {
        case keyBindings.pan:
          if (mouseState.mode === 'pan') return;
          mouseState.mode = 'pan';
          mouseState.cursor = 'grab';
          break;
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key as KeyBindings) {
      case keyBindings.pan:
        mouseState.mode = 'default';
        mouseState.cursor = 'default';
        mouseState.panning = false;
        break;
    }
  };

  const handleMouseDown = (event) => {
    const button = event.button;
    if (button === 0 && mouseState.mode === 'pan') {
      // Left click
      mouseState.panning = true;
      mouseState.cursor = 'grabbing';
      mouseState.anchor = [...mouseState.current];
    }

    broadcast('mousedown', event);
  };

  const handleMouseUp = (event) => {
    const button = event.button;
    if (button === 0 && mouseState.mode === 'pan') {
      // Left click
      mouseState.panning = false;
      mouseState.cursor = 'grab';
      const pan = [containerState.pan[0] + mouseState.delta[0] / containerState.scale, containerState.pan[1] + mouseState.delta[1] / containerState.scale];

      containerState.pan = pan;
    }
  };

  const handleMouseWheel = (event) => {
    if (mouseState.mouseEntered === false) return;
    event.preventDefault();
    event.stopPropagation();
    const { deltaY } = event;
    if (deltaY < 0) {
      // Zoom in
      containerState.scale = containerState.scale * 1.1;
      dispatch('zoom', { scale: containerState.scale });
    } else {
      // Zoom out
      containerState.scale = containerState.scale * 0.9;
      dispatch('zoom', { scale: containerState.scale });
    }
  };
</script>

<svelte:body on:keydown={handleKeyDown} on:keyup={handleKeyUp} on:mousemove={handleMouseMove} on:mousedown={handleMouseDown} on:mouseup={handleMouseUp} />

<div
  class="container"
  bind:clientWidth={width}
  bind:clientHeight={height}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:wheel={handleMouseWheel}
  style={`cursor:${mouseState.cursor}`}
>
  <!-- Image viewport controller container -->
  <div
    class="viewport"
    style={`
    transform:${containerTransform};
    scale:${containerState.scale};
    pointer-events:${mouseState.mode === 'default' ? 'all' : 'none'}
  `}
  >
    <slot props={propsInner} />
  </div>
  <!-- Fixed container -->
  <slot name="fixed" props={propsInner} />
</div>

<style lang="scss">
  .container {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;

    overflow: hidden;
    contain: strict;
  }

  .viewport {
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
