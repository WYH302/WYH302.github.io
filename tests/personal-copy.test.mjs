import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = route => fs.readFileSync(new URL('../' + route, import.meta.url), 'utf8');

test('personal pages do not carry editorial audit instructions or duplicated count strips', () => {
  for (const prefix of ['', 'zh/']) {
    for (const page of ['index.html', 'projects/index.html', 'publications/index.html', 'cv/index.html', 'contact/index.html', 'blog/index.html']) {
      const route = prefix + page;
      assert.doesNotMatch(read(route), /evidence-grid|snapshot-grid|hero-stats|四条相互连接的工作线|档案同步|状态标签采用审慎口径|面向公开阅读的研究方向|Four connected lines of work|Profile synchronization|intentionally conservative|public-facing notes/i, route);
    }
  }
});

test('simpler publication copy retains the distinct publication, submission, and ongoing sections', () => {
  for (const prefix of ['', 'zh/']) {
    const html = read(prefix + 'publications/index.html');
    const parts = html.split('id="current-manuscripts"');
    assert.equal(parts.length, 2);
    assert.match(parts[0], prefix ? /已发表或录用论文/ : /Published and Accepted Papers/);
    assert.equal((parts[1].match(prefix ? /class="item-meta">已投稿 \|/g : /class="item-meta">Submitted manuscript \|/g) || []).length, 8);
    assert.match(parts[1], /research-progress-item/);
    assert.match(parts[1], prefix ? /当前稿件/ : /Current manuscript/);
  }
});

test('project descriptions retain five projects, contribution roles, and the existing deep link', () => {
  for (const prefix of ['', 'zh/']) {
    const html = read(prefix + 'projects/index.html');
    assert.match(html, /id="project-evidence"/);
    assert.equal((html.match(/class="feature-item"/g) || []).length, 5);
    assert.match(html, prefix ? /共同|参与设计/ : /co-designed/);
    assert.match(html, prefix ? /三项相关发明专利/ : /three related invention-patent/);
  }
});
