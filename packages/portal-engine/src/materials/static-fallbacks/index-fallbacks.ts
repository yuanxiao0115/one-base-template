import type { StaticMaterialFallback } from '../material-component-loader';
import AppEntranceIndex from '../base/app-entrance/index.vue';
import BaseButtonGroupIndex from '../base/base-button-group/index.vue';
import BaseCardListIndex from '../base/base-card-list/index.vue';
import BaseFileListIndex from '../base/base-file-list/index.vue';
import BaseFormIndex from '../base/base-form/index.vue';
import BaseIframeContainerIndex from '../base/base-iframe-container/index.vue';
import BaseNoticeIndex from '../base/base-notice/index.vue';
import BaseSearchBoxIndex from '../base/base-search-box/index.vue';
import BaseSimpleContainerIndex from '../base/base-simple-container/index.vue';
import BaseStatIndex from '../base/base-stat/index.vue';
import BaseTabContainerIndex from '../base/base-tab-container/index.vue';
import BaseTimelineIndex from '../base/base-timeline/index.vue';
import ImageLinkListIndex from '../base/image-link-list/index.vue';
import CarouselTextListIndex from '../cms/carousel-text-list/index.vue';
import DeptUploadFilesIndex from '../cms/dept-upload-files/index.vue';
import DocumentCardListIndex from '../cms/document-card-list/index.vue';
import ImageTextColumnIndex from '../cms/image-text-column/index.vue';
import ImageTextListIndex from '../cms/image-text-list/index.vue';
import MailListIndex from '../cms/mail-list/index.vue';
import PublicityEducationIndex from '../cms/publicity-education/index.vue';
import TransparentPlaceholderIndex from '../base/transparent-placeholder/index.vue';

export const STATIC_INDEX_MATERIAL_FALLBACKS: StaticMaterialFallback[] = [
  {
    name: 'base-transparent-placeholder-index',
    section: 'index',
    component: TransparentPlaceholderIndex
  },
  {
    name: 'base-iframe-container-index',
    section: 'index',
    component: BaseIframeContainerIndex
  },
  {
    name: 'base-tab-container-index',
    section: 'index',
    component: BaseTabContainerIndex
  },
  {
    name: 'base-simple-container-index',
    section: 'index',
    component: BaseSimpleContainerIndex
  },
  {
    name: 'app-entrance-index',
    section: 'index',
    aliases: ['base-app-entrance-index', 'pb-app-entrance-index'],
    component: AppEntranceIndex
  },
  {
    name: 'image-link-list-index',
    section: 'index',
    aliases: ['base-image-link-list-index', 'pb-image-link-list-index'],
    component: ImageLinkListIndex
  },
  {
    name: 'cms-image-text-list-index',
    section: 'index',
    aliases: ['pb-image-text-list-index'],
    component: ImageTextListIndex
  },
  {
    name: 'cms-image-text-column-index',
    section: 'index',
    aliases: ['pb-image-text-column-index'],
    component: ImageTextColumnIndex
  },
  {
    name: 'cms-document-card-list-index',
    section: 'index',
    aliases: ['pb-document-card-list-index'],
    component: DocumentCardListIndex
  },
  {
    name: 'cms-carousel-text-list-index',
    section: 'index',
    aliases: ['pb-carousel-text-list-index'],
    component: CarouselTextListIndex
  },
  {
    name: 'cms-publicity-education-index',
    section: 'index',
    aliases: ['pb-publicity-education-index'],
    component: PublicityEducationIndex
  },
  {
    name: 'cms-mail-list-index',
    section: 'index',
    aliases: ['pb-mail-list-index'],
    component: MailListIndex
  },
  {
    name: 'cms-dept-upload-files-index',
    section: 'index',
    aliases: ['pb-dept-upload-files-index'],
    component: DeptUploadFilesIndex
  },
  {
    name: 'base-button-group-index',
    section: 'index',
    component: BaseButtonGroupIndex
  },
  {
    name: 'base-search-box-index',
    section: 'index',
    component: BaseSearchBoxIndex
  },
  {
    name: 'base-notice-index',
    section: 'index',
    component: BaseNoticeIndex
  },
  {
    name: 'base-card-list-index',
    section: 'index',
    component: BaseCardListIndex
  },
  {
    name: 'base-form-index',
    section: 'index',
    component: BaseFormIndex
  },
  {
    name: 'base-stat-index',
    section: 'index',
    component: BaseStatIndex
  },
  {
    name: 'base-file-list-index',
    section: 'index',
    component: BaseFileListIndex
  },
  {
    name: 'base-timeline-index',
    section: 'index',
    component: BaseTimelineIndex
  }
];
