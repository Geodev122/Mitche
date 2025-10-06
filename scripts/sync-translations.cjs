#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const enPath = path.join(localesDir, 'en.json');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

function flatten(obj, prefix = '') {
  const out = {};
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(out, flatten(val, key));
    } else {
      out[key] = val;
    }
  }
  return out;
}

function unflatten(flat) {
  const res = {};
  for (const k of Object.keys(flat)) {
    const parts = k.split('.');
    let cur = res;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) cur[p] = flat[k];
      else cur[p] = cur[p] || {};
      cur = cur[p];
    }
  }
  return res;
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const flatEn = flatten(en);

for (const file of files) {
  const p = path.join(localesDir, file);
  const content = JSON.parse(fs.readFileSync(p, 'utf8'));
  const flat = flatten(content);
  let changed = false;
  for (const k of Object.keys(flatEn)) {
    if (!(k in flat)) {
      flat[k] = `[MISSING TRANSLATION] ${flatEn[k]}`;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(p, JSON.stringify(unflatten(flat), null, 2) + '\n', 'utf8');
    console.log('Updated', file);
  } else {
    console.log('No changes for', file);
  }
}
