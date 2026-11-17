// Reproducible local browser bundle from the lockfile-pinned npm dependency.
import { copyFileSync, mkdirSync } from 'node:fs';
const target = new URL('../assets/js/vendor/', import.meta.url);
mkdirSync(target, {recursive:true});
copyFileSync(new URL('../node_modules/i18next/dist/umd/i18next.min.js', import.meta.url), new URL('i18next.min.js',target));
copyFileSync(new URL('../node_modules/i18next/LICENSE', import.meta.url), new URL('i18next.LICENSE',target));
