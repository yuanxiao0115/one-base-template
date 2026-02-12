import 'element-plus/dist/index.css';
import './styles/index.css';

import { bootstrapAdminApp } from './bootstrap';

const { app, router } = bootstrapAdminApp();

router.isReady().then(() => {
  app.mount('#app');
});
