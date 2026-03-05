import { demoApiClient } from '../api/client';

export const demoDownloadService = {
  async download (fileName?: string) {
    return demoApiClient.download(fileName);
  },
  async downloadError () {
    return demoApiClient.downloadError();
  }
};
