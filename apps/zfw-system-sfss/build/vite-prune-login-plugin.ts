import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { Plugin } from 'vite-plus';
import {
  pruneBuiltChunkPreloadMaps,
  stripIndexHtmlUnusedStylesheets
} from '../../../scripts/vite/manual-chunks';

export function createZfwSystemSfssPruneLoginHtmlAssetsPlugin(): Plugin {
  return {
    name: 'admin-lite-prune-login-html-assets',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const indexHtml = bundle['index.html'];
      if (!indexHtml || indexHtml.type !== 'asset' || typeof indexHtml.source !== 'string') {
        return;
      }

      indexHtml.source = stripIndexHtmlUnusedStylesheets(indexHtml.source, {
        appName: 'zfw-system-sfss'
      });
    },
    writeBundle(outputOptions, bundle) {
      const outputDir =
        typeof outputOptions.dir === 'string'
          ? outputOptions.dir
          : outputOptions.file
            ? dirname(outputOptions.file)
            : fileURLToPath(new URL('../dist', import.meta.url));

      Object.values(bundle).forEach((output) => {
        if (output.type !== 'chunk') {
          return;
        }

        const chunkFile = pathResolve(outputDir, output.fileName);
        if (!existsSync(chunkFile)) {
          return;
        }

        const source = readFileSync(chunkFile, 'utf8');
        const nextSource = pruneBuiltChunkPreloadMaps(source, output.fileName, {
          appName: 'zfw-system-sfss'
        });

        if (nextSource !== source) {
          writeFileSync(chunkFile, nextSource);
        }
      });
    }
  };
}
