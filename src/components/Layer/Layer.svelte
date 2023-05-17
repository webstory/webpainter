<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let width = 0;
  export let height = 0;

  export let keyBindings = {
    pan: ' ',
  };

  let previousTouchAction;
  onMount(() => {
    previousTouchAction = document.body.style.touchAction;
    document.body.style.touchAction = 'none';
  });

  onDestroy(() => {
    document.body.style.touchAction = previousTouchAction;
  });

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

  type BroadcastEvent = MouseEvent | KeyboardEvent | PointerEvent;

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
    } else if (/^pointer/.test(eventName)) {
      eventWrapper.detail = {
        ...event.detail,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        pressure: event.pressure,
        tangentialPressure: event.tangentialPressure,
        tiltX: event.tiltX,
        tiltY: event.tiltY,
        twist: event.twist,
        width: event.width,
        height: event.height,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
      };
    }
    dispatchBroadcast('broadcast', eventWrapper);
  };

  interface PointerState {
    hover: boolean;
    mode: 'default' | 'pan' | 'zoom' | 'rotate';
    cursor: 'default' | 'grab' | 'grabbing';
    panning: boolean;
    current: [number, number];
    anchor: [number, number];
    delta: [number, number];
  }

  // pointerState as PointerState
  $: pointerState = {
    // Current state
    hover: false,
    mode: 'default',
    cursor: 'default',
    panning: false,

    // Cursor position
    current: [0, 0],
    anchor: [0, 0],
    delta: [0, 0],
  };

  $: containerState = {
    pan: [0, 0],
    scale: 1.0,
  };

  let containerTransform = '';

  const handlePointerEnter = () => {
    pointerState.hover = true;
  };

  const handlePointerLeave = () => {
    pointerState.hover = false;
  };

  const handlePointerMove = (event) => {
    // Get current cursor position
    const { clientX, clientY } = event;
    pointerState.current = [clientX, clientY];
    pointerState.delta = [clientX - pointerState.anchor[0], clientY - pointerState.anchor[1]];

    // log pointerState
    // console.log(JSON.stringify(pointerState));
    if (pointerState.panning === true) {
      // Adjust panning distance by container scale factor
      const pan = [containerState.pan[0] + pointerState.delta[0] / containerState.scale, containerState.pan[1] + pointerState.delta[1] / containerState.scale];
      containerTransform = `translate3d(${pan[0]}px, ${pan[1]}px, 0)`;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (pointerState.hover === false) return;
    if (event.key) {
      event.preventDefault();
      event.stopPropagation();
      // dispatch('escape');
      console.log(`[Keydown] ${event.key}`);

      switch (event.key as KeyBindings) {
        case keyBindings.pan:
          if (pointerState.mode === 'pan') return;
          pointerState.mode = 'pan';
          pointerState.cursor = 'grab';
          break;
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key as KeyBindings) {
      case keyBindings.pan:
        pointerState.mode = 'default';
        pointerState.cursor = 'default';
        pointerState.panning = false;
        break;
    }
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { pointerType } = event;
    if (pointerType === 'mouse') {
      // Mouse
      const button = event.button;
      if (button === 0 && pointerState.mode === 'pan' && pointerState.hover === true) {
        // Left click
        pointerState.panning = true;
        pointerState.cursor = 'grabbing';
        pointerState.anchor = [...pointerState.current];
      }
    } else if (pointerType === 'touch') {
      // Touch
    } else if (pointerType === 'pen') {
      // Pen
      if (event.buttons === 1 && pointerState.mode === 'pan' && pointerState.hover === true) {
        pointerState.panning = true;
        pointerState.cursor = 'grabbing';
        pointerState.anchor = [...pointerState.current];
      }
    }
  };

  const handlePointerUp = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { pointerType } = event;
    if (pointerType === 'mouse') {
      // Mouse
      const button = event.button;
      if (button === 0 && pointerState.mode === 'pan' && pointerState.panning === true) {
        pointerState.panning = false;
        pointerState.cursor = 'grab';
        const pan = [
          containerState.pan[0] + pointerState.delta[0] / containerState.scale,
          containerState.pan[1] + pointerState.delta[1] / containerState.scale,
        ];

        containerState.pan = pan;
      }
    } else if (pointerType === 'touch') {
      // Touch
    } else if (pointerType === 'pen') {
      // Pen
      if (event.buttons === 0 && pointerState.mode === 'pan' && pointerState.panning === true) {
        pointerState.panning = false;
        pointerState.cursor = 'grab';
        const pan = [
          containerState.pan[0] + pointerState.delta[0] / containerState.scale,
          containerState.pan[1] + pointerState.delta[1] / containerState.scale,
        ];

        containerState.pan = pan;
      }
    }
  };

  const handleMouseWheel = (event) => {
    if (pointerState.hover === false) return;
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

<svelte:body
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
  on:pointermove={handlePointerMove}
  on:pointerdown={handlePointerDown}
  on:pointerup={handlePointerUp}
/>

<div
  class="container"
  bind:clientWidth={width}
  bind:clientHeight={height}
  on:pointerover={handlePointerEnter}
  on:pointerout={handlePointerLeave}
  on:wheel={handleMouseWheel}
  style:cursor={pointerState.cursor}
>
  <!-- Image viewport controller container -->
  <div
    class="viewport"
    style:transform={containerTransform}
    style:scale={containerState.scale}
    style:pointer-events={pointerState.mode === 'default' ? 'all' : 'none'}
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

    touch-action: none;
  }

  .viewport {
    position: relative;
    width: 100%;
    height: 100%;

    transition: scale 0.2s ease-out;
  }

  .container :global(.wp-layer) {
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
