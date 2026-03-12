<template>
  <div class="preview-layout preview-layout--global-scroll">
    <slot name="header" />
    <div class="preview-layout__content">
      <slot name="content" />
    </div>
    <slot name="footer" />
  </div>
</template>

<style scoped>
  .preview-layout {
    display: flex;
    min-height: 100%;
    flex-direction: column;
  }

  .preview-layout--global-scroll {
    min-height: 100%;
  }

  .preview-layout__content {
    min-height: 0;
  }
</style>
