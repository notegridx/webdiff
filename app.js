// ===== i18n (JA / EN) =====
function detectLang() {
  const langs = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || 'en'];
  const primary = String(langs[0] || 'en').toLowerCase();
  return primary.startsWith('ja') ? 'ja' : 'en';
}

function applyI18n(lang) {
  document.documentElement.lang = lang;

  const dict = {
    ja: {
      desc: '2つのテキストを貼り付けて差分を比較（文字単位）',
      normalizeEol: '改行を正規化',
      clear: '両方クリア',
      themeTitle: 'Auto は OS（ライト/ダーク）に追従します',
      eolTitle: 'CRLF/LFを統一して比較します'
    },
    en: {
      desc: 'Paste two texts to compare differences (character-level).',
      normalizeEol: 'Normalize line endings',
      clear: 'Clear both',
      themeTitle: 'Auto follows your OS (light/dark) setting.',
      eolTitle: 'Compare after normalizing CRLF/LF.'
    }
  };

  const t = dict[lang] || dict.en;

  const elDesc = document.getElementById('txt-desc');
  const elNormalize = document.getElementById('txt-normalizeEol');
  const elClear = document.getElementById('txt-clear');
  const lblTheme = document.getElementById('lbl-theme');
  const lblEol = document.getElementById('lbl-eol');

  if (elDesc) elDesc.textContent = t.desc;
  if (elNormalize) elNormalize.textContent = t.normalizeEol;
  if (elClear) elClear.textContent = t.clear;
  if (lblTheme) lblTheme.title = t.themeTitle;
  if (lblEol) lblEol.title = t.eolTitle;
}

const uiLang = detectLang();
applyI18n(uiLang);

// ===== Theme (Auto / Light / Dark) =====
const THEME_KEY = 'webdiff:theme'; // 'auto' | 'light' | 'dark'
const themeSelect = document.getElementById('theme');
const mql = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(mode) {
  const html = document.documentElement;
  if (mode === 'light') html.setAttribute('data-theme', 'light');
  else if (mode === 'dark') html.setAttribute('data-theme', 'dark');
  else html.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const mode = (saved === 'light' || saved === 'dark' || saved === 'auto') ? saved : 'auto';
  themeSelect.value = mode;
  applyTheme(mode);
}

function saveTheme(mode) {
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode);
}

mql.addEventListener('change', () => {
  if (themeSelect.value === 'auto') applyTheme('auto');
});
themeSelect.addEventListener('change', () => saveTheme(themeSelect.value));
loadTheme();

// ===== Diff App (Chars only) =====
const inLeft = document.getElementById('in-left');
const inRight = document.getElementById('in-right');
const hlLeft = document.getElementById('hl-left');
const hlRight = document.getElementById('hl-right');
const lnLeft = document.getElementById('ln-left');
const lnRight = document.getElementById('ln-right');

const normalizeEol = document.getElementById('normalizeEol');
const clearBtn = document.getElementById('clear');

const TAB_SIZE = 4;

function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function preprocess(text) {
  let t = text ?? '';
  if (normalizeEol.checked) t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return t;
}

function chunkToHtmlPreserveIndent(chunk) {
  let s = escapeHtml(chunk);
  s = s.replace(/\t/g, ' '.repeat(TAB_SIZE));
  s = s.replace(/(^|<br>)( +)/g, (m, p1, p2) => p1 + p2.replace(/ /g, '&nbsp;'));
  s = s.replace(/\n/g, '<br>');
  // keep empty line height without adding visible width
  if (s.endsWith('<br>')) s += '&#8203;';   // zero-width space
  if (s.length === 0) s = '&#8203;';
  return s;
}

function renderFromParts(parts, side) {
  let html = '';

  for (const p of parts) {
    const isAdd = !!p.added;
    const isDel = !!p.removed;

    if (side === 'left' && isAdd) continue;
    if (side === 'right' && isDel) continue;

    const cls = isAdd ? 'add' : isDel ? 'del' : 'same';
    const body = chunkToHtmlPreserveIndent(p.value ?? '');
    html += `<span class="${cls}">${body}</span>`;
  }
  return html || '<span class="same">&nbsp;</span>';
}

function autoGrow(inputEl, highlightEl, linesEl) {
  inputEl.style.height = 'auto';
  const h = inputEl.scrollHeight;
  inputEl.style.height = h + 'px';
  highlightEl.style.height = h + 'px';
  linesEl.style.height = h + 'px';
}

function buildLineNumbers(text) {
  const lines = text.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i++) html += `<span>${i}</span>`;
  return html;
}

function syncScroll(input, highlight, lines) {
  highlight.scrollTop = input.scrollTop;
  highlight.scrollLeft = input.scrollLeft;
  lines.scrollTop = input.scrollTop;
}

// ---- Diff + Render (debounced, IME-safe) ----
let timer = null;
let composing = false;

function scheduleUpdate() {
  if (composing) return;
  clearTimeout(timer);
  timer = setTimeout(updateDiff, 120);
}

function updateDiff() {
  const left = preprocess(inLeft.value);
  const right = preprocess(inRight.value);

  lnLeft.innerHTML = buildLineNumbers(left);
  lnRight.innerHTML = buildLineNumbers(right);

  const parts = Diff.diffChars(left, right);

  hlLeft.innerHTML = renderFromParts(parts, 'left');
  hlRight.innerHTML = renderFromParts(parts, 'right');

  autoGrow(inLeft, hlLeft, lnLeft);
  autoGrow(inRight, hlRight, lnRight);

  syncScroll(inLeft, hlLeft, lnLeft);
  syncScroll(inRight, hlRight, lnRight);
}

inLeft.addEventListener('scroll', () => syncScroll(inLeft, hlLeft, lnLeft));
inRight.addEventListener('scroll', () => syncScroll(inRight, hlRight, lnRight));

for (const el of [inLeft, inRight]) {
  el.addEventListener('input', scheduleUpdate);
  el.addEventListener('paste', scheduleUpdate);
  el.addEventListener('compositionstart', () => { composing = true; });
  el.addEventListener('compositionend', () => { composing = false; scheduleUpdate(); });
}

normalizeEol.addEventListener('change', scheduleUpdate);

clearBtn.addEventListener('click', () => {
  inLeft.value = '';
  inRight.value = '';
  scheduleUpdate();
  inLeft.focus();
});

// click editor area -> focus textarea (still works with line-number lane)
for (const editor of document.querySelectorAll('.editor')) {
  editor.addEventListener('pointerdown', (e) => {
    if (e.target?.classList?.contains('input')) return;
    const ta = editor.querySelector('.input');
    if (!ta) return;
    try { if (document.activeElement !== ta) ta.focus({ preventScroll: true }); }
    catch { ta.focus(); }
  });
}

updateDiff();
