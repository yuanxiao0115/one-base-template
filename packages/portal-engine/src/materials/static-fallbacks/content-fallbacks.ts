import type { StaticMaterialFallback } from '../material-component-loader';
import AppEntranceContent from '../base/app-entrance/content.vue';
import BaseButtonGroupContent from '../base/base-button-group/content.vue';
import BaseCardListContent from '../base/base-card-list/content.vue';
import BaseFileListContent from '../base/base-file-list/content.vue';
import BaseFormContent from '../base/base-form/content.vue';
import BaseIframeContainerContent from '../base/base-iframe-container/content.vue';
import BaseNoticeContent from '../base/base-notice/content.vue';
import BaseSearchBoxContent from '../base/base-search-box/content.vue';
import BaseSimpleContainerContent from '../base/base-simple-container/content.vue';
import BaseStatContent from '../base/base-stat/content.vue';
import BaseTabContainerContent from '../base/base-tab-container/content.vue';
import BaseTimelineContent from '../base/base-timeline/content.vue';
import ImageLinkListContent from '../base/image-link-list/content.vue';
import CarouselTextListContent from '../cms/carousel-text-list/content.vue';
import DeptUploadFilesContent from '../cms/dept-upload-files/content.vue';
import DocumentCardListContent from '../cms/document-card-list/content.vue';
import ImageTextColumnContent from '../cms/image-text-column/content.vue';
import ImageTextListContent from '../cms/image-text-list/content.vue';
import MailListContent from '../cms/mail-list/content.vue';
import PublicityEducationContent from '../cms/publicity-education/content.vue';
import TransparentPlaceholderContent from '../base/transparent-placeholder/content.vue';

export const STATIC_CONTENT_MATERIAL_FALLBACKS: StaticMaterialFallback[] = [
  {
    name: 'base-transparent-placeholder-content',
    section: 'content',
    component: TransparentPlaceholderContent
  },
  {
    name: 'base-iframe-container-content',
    section: 'content',
    component: BaseIframeContainerContent
  },
  {
    name: 'base-tab-container-content',
    section: 'content',
    component: BaseTabContainerContent
  },
  {
    name: 'base-simple-container-content',
    section: 'content',
    component: BaseSimpleContainerContent
  },
  {
    name: 'app-entrance-content',
    section: 'content',
    aliases: ['base-app-entrance-content', 'pb-app-entrance-content'],
    component: AppEntranceContent
  },
  {
    name: 'image-link-list-content',
    section: 'content',
    aliases: ['base-image-link-list-content', 'pb-image-link-list-content'],
    component: ImageLinkListContent
  },
  {
    name: 'cms-image-text-list-content',
    section: 'content',
    aliases: ['pb-image-text-list-content'],
    component: ImageTextListContent
  },
  {
    name: 'cms-image-text-column-content',
    section: 'content',
    aliases: ['pb-image-text-column-content'],
    component: ImageTextColumnContent
  },
  {
    name: 'cms-document-card-list-content',
    section: 'content',
    aliases: ['pb-document-card-list-content'],
    component: DocumentCardListContent
  },
  {
    name: 'cms-carousel-text-list-content',
    section: 'content',
    aliases: ['pb-carousel-text-list-content'],
    component: CarouselTextListContent
  },
  {
    name: 'cms-publicity-education-content',
    section: 'content',
    aliases: ['pb-publicity-education-content'],
    component: PublicityEducationContent
  },
  {
    name: 'cms-mail-list-content',
    section: 'content',
    aliases: ['pb-mail-list-content'],
    component: MailListContent
  },
  {
    name: 'cms-dept-upload-files-content',
    section: 'content',
    aliases: ['pb-dept-upload-files-content'],
    component: DeptUploadFilesContent
  },
  {
    name: 'base-button-group-content',
    section: 'content',
    component: BaseButtonGroupContent
  },
  {
    name: 'base-search-box-content',
    section: 'content',
    component: BaseSearchBoxContent
  },
  {
    name: 'base-notice-content',
    section: 'content',
    component: BaseNoticeContent
  },
  {
    name: 'base-card-list-content',
    section: 'content',
    component: BaseCardListContent
  },
  {
    name: 'base-form-content',
    section: 'content',
    component: BaseFormContent
  },
  {
    name: 'base-stat-content',
    section: 'content',
    component: BaseStatContent
  },
  {
    name: 'base-file-list-content',
    section: 'content',
    component: BaseFileListContent
  },
  {
    name: 'base-timeline-content',
    section: 'content',
    component: BaseTimelineContent
  }
];
