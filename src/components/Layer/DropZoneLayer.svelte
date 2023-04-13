<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  $: width = 1;
  $: height = 1;

  onMount(() => {});

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('dragenter');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('dragleave');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('dragover');
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('drop', event);

    // If it is an image, then get a image data as an array buffer
    const files = event.dataTransfer.files;
    console.log('files', files);
    if (files.length > 0) {
      const file = files[0];
      const { name, lastModified, size, type } = file;
      console.log('file', name, lastModified, size, type);

      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        width = img.width;
        height = img.height;
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
      };

      // read file content as base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('click');
  };
</script>

<div
  class="layer"
  {width}
  {height}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  on:click={handleClick}
>
  <slot />
  <canvas class="debug border-red" bind:this={canvas} />
</div>
