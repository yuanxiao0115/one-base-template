import type { StaticMaterialFallback } from '../material-component-loader';
import AppEntranceStyle from '../base/app-entrance/style.vue';
import BaseButtonGroupStyle from '../base/base-button-group/style.vue';
import BaseCardListStyle from '../base/base-card-list/style.vue';
import BaseFileListStyle from '../base/base-file-list/style.vue';
import BaseFormStyle from '../base/base-form/style.vue';
import BaseIframeContainerStyle from '../base/base-iframe-container/style.vue';
import BaseNoticeStyle from '../base/base-notice/style.vue';
import BaseSearchBoxStyle from '../base/base-search-box/style.vue';
import BaseSimpleContainerStyle from '../base/base-simple-container/style.vue';
import BaseStatStyle from '../base/base-stat/style.vue';
import BaseTabContainerStyle from '../base/base-tab-container/style.vue';
import BaseTimelineStyle from '../base/base-timeline/style.vue';
import ImageLinkListStyle from '../base/image-link-list/style.vue';
import CarouselTextListStyle from '../cms/carousel-text-list/style.vue';
import DeptUploadFilesStyle from '../cms/dept-upload-files/style.vue';
import DocumentCardListStyle from '../cms/document-card-list/style.vue';
import ImageTextColumnStyle from '../cms/image-text-column/style.vue';
import ImageTextListStyle from '../cms/image-text-list/style.vue';
import MailListStyle from '../cms/mail-list/style.vue';
import PublicityEducationStyle from '../cms/publicity-education/style.vue';
import TransparentPlaceholderStyle from '../base/transparent-placeholder/style.vue';

export const STATIC_STYLE_MATERIAL_FALLBACKS: StaticMaterialFallback[] = [
  {
    name: 'base-transparent-placeholder-style',
    section: 'style',
    component: TransparentPlaceholderStyle
  },
  {
    name: 'base-iframe-container-style',
    section: 'style',
    component: BaseIframeContainerStyle
  },
  {
    name: 'base-tab-container-style',
    section: 'style',
    component: BaseTabContainerStyle
  },
  {
    name: 'base-simple-container-style',
    section: 'style',
    component: BaseSimpleContainerStyle
  },
  {
    name: 'app-entrance-style',
    section: 'style',
    aliases: ['base-app-entrance-style', 'pb-app-entrance-style'],
    component: AppEntranceStyle
  },
  {
    name: 'image-link-list-style',
    section: 'style',
    aliases: ['base-image-link-list-style', 'pb-image-link-list-style'],
    component: ImageLinkListStyle
  },
  {
    name: 'cms-image-text-list-style',
    section: 'style',
    aliases: ['pb-image-text-list-style'],
    component: ImageTextListStyle
  },
  {
    name: 'cms-image-text-column-style',
    section: 'style',
    aliases: ['pb-image-text-column-style'],
    component: ImageTextColumnStyle
  },
  {
    name: 'cms-document-card-list-style',
    section: 'style',
    aliases: ['pb-document-card-list-style'],
    component: DocumentCardListStyle
  },
  {
    name: 'cms-carousel-text-list-style',
    section: 'style',
    aliases: ['pb-carousel-text-list-style'],
    component: CarouselTextListStyle
  },
  {
    name: 'cms-publicity-education-style',
    section: 'style',
    aliases: ['pb-publicity-education-style'],
    component: PublicityEducationStyle
  },
  {
    name: 'cms-mail-list-style',
    section: 'style',
    aliases: ['pb-mail-list-style'],
    component: MailListStyle
  },
  {
    name: 'cms-dept-upload-files-style',
    section: 'style',
    aliases: ['pb-dept-upload-files-style'],
    component: DeptUploadFilesStyle
  },
  {
    name: 'base-button-group-style',
    section: 'style',
    component: BaseButtonGroupStyle
  },
  {
    name: 'base-search-box-style',
    section: 'style',
    component: BaseSearchBoxStyle
  },
  {
    name: 'base-notice-style',
    section: 'style',
    component: BaseNoticeStyle
  },
  {
    name: 'base-card-list-style',
    section: 'style',
    component: BaseCardListStyle
  },
  {
    name: 'base-form-style',
    section: 'style',
    component: BaseFormStyle
  },
  {
    name: 'base-stat-style',
    section: 'style',
    component: BaseStatStyle
  },
  {
    name: 'base-file-list-style',
    section: 'style',
    component: BaseFileListStyle
  },
  {
    name: 'base-timeline-style',
    section: 'style',
    component: BaseTimelineStyle
  }
];
