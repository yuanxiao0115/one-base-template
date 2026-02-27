import { demoApiClient } from '../api/client';

export const demoDownloadService = {
  download(fileName?: string) {
    return demoApiClient.download(fileName);
  },
  downloadError() {
    return demoApiClient.downloadError();
  }
};
