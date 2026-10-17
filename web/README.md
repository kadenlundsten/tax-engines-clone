// app.js — dashboard controller (browser ESM)
import { computePaycheck } from '../engines/paycheck-engine.js';
import { computeBonus } from '../engines/bonus-tax.js';

let taxData, suppData;

async function init() {
  try {
    [taxData, suppData] = await Promise.all([
      fetch('../data/tax-data-2026.json').then(r=>r.json()),
      fetch('../data/state-supplemental-2026.json').then(r=>r.json()).catch(()=>({}))
    ]);
  } catch (e) {
    showRaw('Failed to load data: ' + e);
    return;
  }

  populateStateSelectors();
  attachNav();
  attachHandlers();
}

function populateStateSelectors(){
  const states = Object.keys(taxData.states || {}).sort();
  const opts = ['<option value="">(none)</option>', ...states.map(s=>`<option value="${s}">${s}</option>`)].join('');
  document.getElementById('pc-state').innerHTML = opts;
  document.getElementById('bn-state').innerHTML = opts;
}

function attachNav(){
  document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.nav-btn').forEach(n=>n.classList.remove('active'));
    b.classList.add('active');
    showView(b.getAttribute('data-view'));
  }));
}

function showView(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
  document.getElementById('view-'+view).classList.remove('hidden');
  document.getElementById('view-title').textContent = view === 'home' ? 'Dashboard' : (view.charAt(0).toUpperCase()+view.slice(1));
}

function attachHandlers(){
  // Paycheck
  document.getElementById('pc-run').addEventListener('click', async ()=>{
    const input = readPaycheckInputs();
    const res = computePaycheck(input, taxData);
    renderPaycheck(res);
  });
  document.getElementById('pc-example').addEventListener('click', ()=>{
    document.getElementById('pc-wageType').value='salary';
    document.getElementById('pc-amount').value=90000;
    document.getElementById('pc-freq').value='biweekly';
    document.getElementById('pc-filing').value='single';
    if(document.getElementById('pc-state').options.length>1) document.getElementById('pc-state').selectedIndex=1;
  });

  // Bonus
  document.getElementById('bn-run').addEventListener('click', ()=>{
    const input = readBonusInputs();
    const res = computeBonus(input, taxData, suppData);
    renderBonus(res);
  });
  document.getElementById('bn-example').addEventListener('click', ()=>{
    document.getElementById('bn-bonus').value=5000;document.getElementById('bn-reg').value=90000;document.getElementById('bn-method').value='flat';if(document.getElementById('bn-state').options.length>1) document.getElementById('bn-state').selectedIndex=1;
  });

  // sample/run both
  document.getElementById('run-sample').addEventListener('click', async ()=>{
    document.getElementById('pc-amount').value=90000;document.getElementById('pc-freq').value='biweekly';document.getElementById('pc-filing').value='single';if(document.getElementById('pc-state').options.length>1) document.getElementById('pc-state').selectedIndex=1;
    document.getElementById('bn-bonus').value=5000;document.getElementById('bn-reg').value=90000;document.getElementById('bn-method').value='flat';if(document.getElementById('bn-state').options.length>1) document.getElementById('bn-state').selectedIndex=1;
    // run both
    const pc = computePaycheck(readPaycheckInputs(), taxData);
    renderPaycheck(pc);
    const bn = computeBonus(readBonusInputs(), taxData, suppData);
    renderBonus(bn);
    showView('paycheck');
  });

  document.getElementById('open-raw').addEventListener('click', ()=>{
    document.getElementById('raw-content').textContent = 'tax-data and supp-data loaded. Use the Raw buttons near results to inspect.';
    document.getElementById('raw-dialog').showModal();
  });
  document.getElementById('raw-close').addEventListener('click', ()=>document.getElementById('raw-dialog').close());

  // wage type toggles
  document.getElementById('pc-wageType').addEventListener('change', (e)=>{
    document.getElementById('pc-hoursLabel').style.display = e.target.value==='hourly' ? 'block' : 'none';
  });
}

function readPaycheckInputs(){
  const wageType = document.getElementById('pc-wageType').value;
  const amount = Number(document.getElementById('pc-amount').value) || 0;
  const hours = Number(document.getElementById('pc-hours').value) || 40;
  const freq = document.getElementById('pc-freq').value;
  const state = document.getElementById('pc-state').value;
  const filing = document.getElementById('pc-filing').value;
  const wage = wageType === 'hourly' ? {type:'hourly', amount, hoursPerWeek:hours} : {type:'salary', amount};
  return { wage, payFrequency: freq, stateSlug: state, filingStatus: filing };
}

function readBonusInputs(){
  const bonus = Number(document.getElementById('bn-bonus').value) || 0;
  const reg = Number(document.getElementById('bn-reg').value) || 0;
  const filing = document.getElementById('bn-filing').value;
  const method = document.getElementById('bn-method').value;
  const state = document.getElementById('bn-state').value;
  return { bonus, regIncome: reg, filingStatus: filing, method, stateSlug: state };
}

function renderPaycheck(res){
  const el = document.getElementById('pc-output');
  el.innerHTML = '';
  const title = document.createElement('h3'); title.textContent='Paycheck result'; el.appendChild(title);

  const stats = document.createElement('div');
  stats.innerHTML = `
    <p><strong>Annual gross:</strong> $${res.annual.gross.toFixed(2)}</p>
    <p><strong>Annual net:</strong> $${res.annual.net.toFixed(2)}</p>
    <p><strong>Total tax:</strong> $${res.annual.totalTax.toFixed(2)} (${(res.annual.effectiveRate*100).toFixed(1)}%)</p>
    <p><strong>Per-paycheck net:</strong> $${res.perPaycheck.net.toFixed(2)}</p>
    <p><strong>Federal:</strong> $${res.annual.federal.toFixed(2)}</p>
    <p><strong>State:</strong> $${res.annual.state.toFixed(2)}</p>
    <p><strong>FICA:</strong> $${(res.annual.socialSecurity+res.annual.medicare).toFixed(2)}</p>
  `;
  el.appendChild(stats);

  const rawBtn = document.createElement('button'); rawBtn.className='btn ghost'; rawBtn.textContent='Raw JSON';
  rawBtn.addEventListener('click', ()=>{ showRaw(JSON.stringify(res, null, 2)); });
  el.appendChild(rawBtn);
}

function renderBonus(res){
  const el = document.getElementById('bn-output');
  el.innerHTML = '';
  const title = document.createElement('h3'); title.textContent='Bonus result'; el.appendChild(title);

  const stats = document.createElement('div');
  stats.innerHTML = `
    <p><strong>Bonus:</strong> $${res.bonus.toFixed(2)}</p>
    <p><strong>Withheld (now):</strong> $${res.withheld.total.toFixed(2)} (Federal $${res.withheld.federal.toFixed(2)}, State $${res.withheld.state.toFixed(2)}, FICA $${res.withheld.fica.toFixed(2)})</p>
    <p><strong>True tax (filing):</strong> $${res.trueLiability.total.toFixed(2)} (Federal $${res.trueLiability.federal.toFixed(2)}, State $${res.trueLiability.state.toFixed(2)}, FICA $${res.trueLiability.fica.toFixed(2)})</p>
    <p><strong>Delta (withheld - true income tax):</strong> $${res.delta.toFixed(2)} — ${res.refund ? 'You are likely owed a refund' : 'You may owe additional tax'}</p>
  `;
  el.appendChild(stats);
  const rawBtn = document.createElement('button'); rawBtn.className='btn ghost'; rawBtn.textContent='Raw JSON';
  rawBtn.addEventListener('click', ()=>{ showRaw(JSON.stringify(res, null, 2)); });
  el.appendChild(rawBtn);
}

function showRaw(text){
  document.getElementById('raw-content').textContent = text;
  document.getElementById('raw-dialog').showModal();
}

init();
