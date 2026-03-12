<template>
  <div class="preview-layout preview-layout--header-fixed-content-scroll">
    <div class="preview-layout__header">
      <slot name="header" />
    </div>
    <div class="preview-layout__content">
      <div class="preview-layout__content-scroll">
        <slot name="content" />
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .preview-layout {
    display: flex;
    min-height: 0;
    height: 100%;
    flex-direction: column;
  }

  .preview-layout__header,
  .preview-layout__footer {
    flex: none;
    min-height: 0;
  }

  .preview-layout__content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .preview-layout__content-scroll {
    height: 100%;
    min-height: 0;
    overflow: auto;
  }
</style>
