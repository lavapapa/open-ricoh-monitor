import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const config = JSON.parse(readFileSync(new URL('../apps/desktop/src-tauri/tauri.conf.json', import.meta.url), 'utf8'));

export function downloads(version, productName = config.productName) {
  const base = `https://github.com/lavapapa/open-ricoh-monitor/releases/download/v${version}/${productName}_${version}`;
  const mirror = `https://gitee.com/marvinfore/open-richo-monitor/releases/download/v${version}/${productName}_${version}`;
  return `<!-- downloads:start -->
| 你的电脑 | 点击下载 | 国内镜像 |
| --- | --- | --- |
| Mac · Apple Silicon（M1、M2、M3、M4 等） | [下载 Mac Apple Silicon 版](${base}_aarch64.dmg) | [Gitee 下载](${mirror}_aarch64.dmg) |
| Mac · Intel | [下载 Mac Intel 版](${base}_x64.dmg) | [Gitee 下载](${mirror}_x64.dmg) |
| Windows · 64 位 | [下载 Windows 版](${base}_x64-setup.exe) | [Gitee 下载](${mirror}_x64-setup.exe) |
<!-- downloads:end -->`;
}

export function updateReadme(current, version, productName) {
  if (!current.includes('<!-- downloads:start -->')) throw new Error('README 缺少下载表格标记。');
  const published = current.match(/\/([^/\s]+)_(\d+\.\d+\.\d+)_aarch64\.dmg\)/);
  const name = productName ?? (published?.[2] === version ? published[1] : config.productName);
  const table = downloads(version, name).replaceAll('\n', current.includes('\r\n') ? '\r\n' : '\n');
  return current.replace(/<!-- downloads:start -->[\s\S]*?<!-- downloads:end -->/, table);
}

export function checkReadme(current, version) {
  const table = current.match(/<!-- downloads:start -->[\s\S]*?<!-- downloads:end -->/)?.[0] ?? '';
  const productName = table.match(/\/([^/\s]+)_\d+\.\d+\.\d+_aarch64\.dmg\)/)?.[1];
  if (!productName || updateReadme(current, version, productName) !== current) throw new Error('下载链接版本未同步，请运行 node scripts/update-readme-downloads.mjs。');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const readme = new URL('../README.md', import.meta.url);
  const version = config.version;
  const current = readFileSync(readme, 'utf8');
  if (process.argv.includes('--check')) {
    checkReadme(current, version);
  } else writeFileSync(readme, updateReadme(current, version));
}
