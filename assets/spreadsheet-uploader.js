// assets/spreadsheet-uploader.js
// Minimal uploader + XLSX/CSV parsing + mapping -> paycheck-engine compute
// Assumes window.XLSX is available (SheetJS CDN included by the page).
import { computePaycheck } from '../engines/paycheck-engine.js';

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

let parsedRows = []; // array of objects: {col1:val, col2:val, ...}
let headers = [];

function showPreview(rows) {
  const preview = $('#preview');
  const container = $('#preview-table');
  if (!rows || rows.length === 0) {
    preview.hidden = true;
    container.innerHTML = '';
    return;
  }
  preview.hidden = false;
  const max = Math.min(10, rows.length);
  const table = document.createElement('table');
  table.className = 'preview-table';
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  for (let i = 0; i < max; i++) {
    const r = rows[i];
    const tr = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = r[h] ?? '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

function buildMappingSelects() {
  const selects = [
    'map-wage','map-wage-type','map-hours','map-filing','map-frequency','map-state',
    'map-401k','map-cafeteria','map-dep','map-extra','map-post'
  ];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value=\"\">(none)</option>' + headers.map(h => `<option value="${h}">${h}</option>`).join('');
  });

  // Populate some sensible defaults for wage type, filing, frequency, state
  const wageType = $('#map-wage-type');
  if (wageType) {
    wageType.value = headers.includes('wage_type') ? 'wage_type' : '';
    wageType.innerHTML = '<option value=\"\">(none)</option><option value=\"hourly\">hourly</option><option value=\"salary\">salary</option>' + headers.map(h => `<option value="${h}">${h}</option>`).join('');
  }
  const filing = $('#map-filing');
  if (filing) {
    filing.innerHTML = '<option value=\"\">(none)</option><option value=\"single\">single</option><option value=\"married\">married</option>' + headers.map(h => `<option value="${h}">${h}</option>`).join('');
  }
  const freq = $('#map-frequency');
  if (freq) {
    freq.innerHTML = '<option value=\"monthly\">monthly</option><option value=\"biweekly\">biweekly</option><option value=\"weekly\">weekly</option>' + headers.map(h => `<option value="${h}">${h}</option>`).join('');
  }
  const stateSel = $('#map-state');
  if (stateSel) {
    stateSel.innerHTML = '<option value=\"\">(none)</option>' + headers.map(h => `<option value="${h}">${h}</option>`).join('');
  }
}

function parseFile(file) {
  const reader = new FileReader();
  const ext = (file.name || '').split('.').pop().toLowerCase();
  reader.onload = (e) => {
    try {
      let workbook;
      if (ext === 'csv') {
        // parse CSV directly
        workbook = window.XLSX.read(e.target.result, { type: 'binary', raw: false, codepage: 65001 });
      } else {
        const data = e.target.result;
        // read as binary string or arrayBuffer depending on SheetJS support
        workbook = window.XLSX.read(data, { type: 'binary' });
      }
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const json = window.XLSX.utils.sheet_to_json(sheet, { defval: '' });
      parsedRows = json;
      headers = json.length ? Object.keys(json[0]) : [];
      $('#file-name').textContent = `${file.name} — ${json.length} rows, ${headers.length} columns`;
      showPreview(parsedRows);
      buildMappingSelects();
      $('#mapping').hidden = false;
      $('#results').hidden = true;
    } catch (err) {
      alert('Failed to parse file: ' + err.message);
      console.error(err);
    }
  };

  if (ext === 'csv') {
    reader.readAsBinaryString(file);
  } else {
    reader.readAsBinaryString(file);
  }
}

function initDragAndDrop() {
  const drop = $('#drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', (e) => { e.preventDefault(); drop.classList.remove('dragover'); });
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('dragover');
    const f = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) || null;
    if (f) {
      $('#file').files = e.dataTransfer.files;
      parseFile(f);
    }
  });
  $('#file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) parseFile(f);
  });
}

function downloadJSON() {
  if (!parsedRows || !parsedRows.length) return alert('No parsed data');
  const blob = new Blob([JSON.stringify(parsedRows, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'data.json'; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function downloadCSV() {
  if (!parsedRows || !parsedRows.length) return alert('No parsed data');
  const ws = window.XLSX.utils.json_to_sheet(parsedRows);
  const csv = window.XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'data.csv'; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function copyJSON() {
  if (!parsedRows || !parsedRows.length) return alert('No parsed data');
  navigator.clipboard.writeText(JSON.stringify(parsedRows, null, 2)).then(() => {
    alert('Copied JSON to clipboard');
  }).catch(e => alert('Copy failed: ' + e.message));
}

function mapValue(row, colOrLiteral) {
  if (!colOrLiteral) return undefined;
  // If the mapping value equals a header name, return that column; else return it as literal
  if (headers.includes(colOrLiteral)) return row[colOrLiteral];
  return colOrLiteral;
}

async function computeAll(useFirstOnly = false) {
  if (!parsedRows || !parsedRows.length) return alert('No parsed rows to compute');
  const mapping = {
    wage: $('#map-wage').value,
    wageType: $('#map-wage-type').value,
    hours: $('#map-hours').value,
    filing: $('#map-filing').value,
    freq: $('#map-frequency').value,
    state: $('#map-state').value,
    retirement401k: $('#map-401k').value,
    cafeteria125: $('#map-cafeteria').value,
    dependentsCredit: $('#map-dep').value,
    extraWithholding: $('#map-extra').value,
    postTax: $('#map-post').value
  };

  const results = [];
  const rowsToCompute = useFirstOnly ? [parsedRows[0]] : parsedRows;
  for (const row of rowsToCompute) {
    // build engine input
    const wageValRaw = mapValue(row, mapping.wage);
    const wageTypeRaw = mapValue(row, mapping.wageType) || 'salary';
    const hoursRaw = mapValue(row, mapping.hours);
    const wage = {
      type: String(wageTypeRaw).toLowerCase() === 'hourly' ? 'hourly' : 'salary',
      amount: Number(wageValRaw || 0),
      hoursPerWeek: hoursRaw ? Number(hoursRaw) : undefined
    };
    const input = {
      wage,
      filingStatus: String(mapValue(row, mapping.filing) || 'single'),
      payFrequency: String(mapValue(row, mapping.freq) || 'monthly'),
      stateSlug: String(mapValue(row, mapping.state) || '').toLowerCase(),
      adv: {
        retirement401k: Number(mapValue(row, mapping.retirement401k) || 0),
        cafeteria125: Number(mapValue(row, mapping.cafeteria125) || 0),
        dependentsCredit: Number(mapValue(row, mapping.dependentsCredit) || 0),
        extraWithholding: Number(mapValue(row, mapping.extraWithholding) || 0),
        postTax: Number(mapValue(row, mapping.postTax) || 0)
      }
    };

    // fetch tax data JSON once (cache)
    if (!window.__taxData) {
      try {
        const r = await fetch('../data/tax-data-2026.json');
        window.__taxData = await r.json();
      } catch (e) {
        alert('Failed to load tax data: ' + e.message);
        console.error(e);
        return;
      }
    }
    try {
      const out = computePaycheck(input, window.__taxData);
      results.push({ input, out });
    } catch (err) {
      results.push({ input, error: String(err) });
    }
    if (useFirstOnly) break;
  }

  $('#results').hidden = false;
  $('#results-json').textContent = JSON.stringify(results, null, 2);
}

function initControls() {
  $('#download-json').addEventListener('click', downloadJSON);
  $('#download-csv').addEventListener('click', downloadCSV);
  $('#copy-json').addEventListener('click', copyJSON);
  $('#compute').addEventListener('click', () => computeAll(false));
  $('#compute-first').addEventListener('click', () => computeAll(true));
}

function init() {
  initDragAndDrop();
  initControls();
  $('#mapping').hidden = true;
  $('#results').hidden = true;
}

document.addEventListener('DOMContentLoaded', init);
