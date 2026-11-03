import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downloads, updateReadme, checkReadme } from './update-readme-downloads.mjs';
test('Windows 检出后的 CRLF 不影响下载表格校验', () => {
  const current = `说明\r\n${downloads('0.1.4').replaceAll('\n', '\r\n')}\r\n`;
  assert.equal(updateReadme(current, '0.1.4'), current);
  assert.match(updateReadme(current, '0.1.5'), /RicohMonitor_0\.1\.5/);
});
test('三种普通安装包以清楚的系统名称呈现，版本共同更新', () => {
  const table = downloads('0.2.0');
  for (const suffix of ['aarch64.dmg', 'x64.dmg', 'x64-setup.exe']) assert.match(table, new RegExp(`RicohMonitor_0\\.2\\.0_${suffix.replaceAll('.', '\\.')}`));
  assert(!table.includes('.sig'));
  assert(!table.includes('.tar.gz'));
});
test('已发行下载按实际文件名校验，下一次生成使用应用名称', () => {
  const current = downloads('0.1.7', 'PublishedMonitor');
  assert.equal(updateReadme(current, '0.1.7'), current);
  assert.doesNotThrow(() => checkReadme(current, '0.1.7'));
  assert.throws(() => checkReadme(current, '0.1.8'), /未同步/);
  assert.throws(() => checkReadme(current.replace('_x64.dmg', '_missing.dmg'), '0.1.7'), /未同步/);
  assert.match(updateReadme(current, '0.1.8'), /RicohMonitor_0\.1\.8/);
});
