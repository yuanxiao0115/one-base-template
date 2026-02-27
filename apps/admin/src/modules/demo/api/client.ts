import { getAppHttpClient } from '@/shared/api/http-client';
import { demoEndpoints } from './endpoints';

function getHttp() {
  return getAppHttpClient();
}

export const demoApiClient = {
  download(fileName = 'ob-demo.txt') {
    return getHttp().get(demoEndpoints.downloadOk, {
      $isDownload: true,
      $downloadFileName: fileName
    });
  },
  downloadError() {
    return getHttp().get(demoEndpoints.downloadError, {
      $isDownload: true
    });
  }
};
