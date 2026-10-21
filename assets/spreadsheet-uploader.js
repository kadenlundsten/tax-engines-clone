(function(){
  const REQUIRED_FIELDS = [
    'employee_name', 'wage_type', 'state', 'filing_status', 'pay_frequency'
  ];

  const FIELD_ALIASES = {
    employee_name: ['employee_name', 'employee', 'name', 'person'],
    wage_type: ['wage_type', 'type', 'pay_type'],
    annual_salary: ['annual_salary', 'salary', 'gross_salary', 'annual_pay'],
    hourly_rate: ['hourly_rate', 'rate', 'hourly'],
    hours_per_week: ['hours_per_week', 'hours', 'weekly_hours'],
    state: ['state', 'state_code', 'state_abbr'],
    filing_status: ['filing_status', 'status', 'filing', 'tax_status'],
    pay_frequency: ['pay_frequency', 'frequency', 'pay_period'],
    401k: ['401k', 'retirement_401k', 'retirement', 'pre_tax_401k'],
    hsa_fsa: ['hsa_fsa', 'cafeteria_125', 'health_premiums', 'hsa', 'fsa'],
    post_tax_deductions: ['post_tax_deductions', 'post_tax', 'after_tax_deductions', 'after_tax'],
    dependents: ['dependents', 'children', 'dependents_credit'],
    extra_withholding: ['extra_withholding', 'extra_federal_withholding', 'withholding'],
    bonus: ['bonus', 'extra_pay', 'bonus_amount']
  };

  const STATE_RATES = {
    US:0, AL:0, AK:0, AZ:0.025, AR:0.04, CA:0.093, CO:0.044, CT:0.03, DE:0.022, FL:0, GA:0.053,
    HI:0.014, IA:0.034, ID:0, IL:0.0495, IN:0.0323, KS:0.049, KY:0.05, LA:0.04, MA:0.05, MD:0.05,
    ME:0.058, MI:0.0425, MN:0.04875, MO:0.043, MS:0.04, MT:0, NC:0.0525, ND:0.0225, NE:0.024,
    NH:0, NJ:0.0525, NM:0.03, NV:0, NY:0.052, OH:0.028, OK:0.04, OR:0.09, PA:0.0307, RI:0.0375,
    SC:0.06, SD:0, TN:0, TX:0, UT:0.048, VA:0.05, VT:0.033, WA:0, WI:0.0465, WV:0.035, WY:0
  };

  const FEDERAL_BRACKETS = {
    single: [[11000,0.10],[44725,0.12],[95375,0.22],[182100,0.24],[231250,0.32],[578125,0.35],[Infinity,0.37]],
    married_joint: [[22000,0.10],[89450,0.12],[190750,0.22],[364200,0.24],[462638,0.32],[693750,0.35],[Infinity,0.37]],
    married_separate: [[11000,0.10],[44725,0.12],[95375,0.22],[182100,0.24],[231250,0.32],[346875,0.35],[Infinity,0.37]],
    head_household: [[15700,0.10],[59850,0.12],[95350,0.22],[182100,0.24],[231250,0.32],[578125,0.35],[Infinity,0.37]],
    hoh: [[15700,0.10],[59850,0.12],[95350,0.22],[182100,0.24],[231250,0.32],[578125,0.35],[Infinity,0.37]]
  };

  const STANDARD_DEDUCTION = {
    single:15000,
    married_joint:30000,
    married_separate:15000,
    head_household:22500,
    hoh:22500
  };

  const PAY_PERIODS = { annual:1, biweekly:26, semimonthly:24, monthly:12, weekly:52 };

  function currency(value) {
    return new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(Number(value) || 0);
  }

  function normalizeHeader(header) {
    return String(header || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  }

  function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const cleaned = String(value).replace(/[$,%\s]/g, '').replace(/,/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  function normalizeRow(row) {
    const result = {};
    for (const key of Object.keys(row)) {
      result[normalizeHeader(key)] = row[key];
    }
    return result;
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          value += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(value);
        value = '';
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && next === '\n') i++;
        row.push(value);
        if (row.some(cell => String(cell).trim() !== '')) rows.push(row);
        row = [];
        value = '';
      } else {
        value += ch;
      }
    }

    if (value !== '' || row.length) {
      row.push(value);
      if (row.some(cell => String(cell).trim() !== '')) rows.push(row);
    }

    return rows;
  }

  function deriveField(row, aliases) {
    for (const alias of aliases) {
      const match = Object.keys(row).find(key => key === normalizeHeader(alias));
      if (match) return row[match];
    }
    return undefined;
  }

  function mapCsvRows(text) {
    const rows = parseCSV(text);
    if (rows.length < 2) throw new Error('CSV must include a header row and at least one data row.');

    const rawHeader = rows[0].map(h => normalizeHeader(h));
    const normalizedRowMap = rows.slice(1).map(normalizeRow);

    const mapped = normalizedRowMap.map((row) => {
      const mappedRow = {};
      for (const [canonicalKey, aliases] of Object.entries(FIELD_ALIASES)) {
        const value = deriveField(row, aliases);
        mappedRow[canonicalKey] = value;
      }
      return mappedRow;
    });

    const missing = REQUIRED_FIELDS.filter((field) => {
      return !mapped.some(item => {
        const value = item[field];
        return value !== undefined && String(value).trim() !== '';
      });
    });

    if (missing.length) {
      throw new Error('Missing required CSV fields: ' + missing.join(', '));
    }

    return mapped;
  }

  function progressiveTax(taxable, brackets) {
    if (taxable <= 0) return 0;
    let total = 0;
    let lower = 0;
    for (const [limit, rate] of brackets) {
      if (taxable <= lower) break;
      const slice = Math.min(taxable, limit) - lower;
      total += slice * rate;
      lower = limit;
    }
    return total;
  }

  function calculatePayrollRow(row) {
    const employeeName = String(row.employee_name || 'Employee').trim() || 'Employee';
    const wageType = String(row.wage_type || 'salary').toLowerCase();
    const filingStatus = String(row.filing_status || 'single').toLowerCase().replace(/\s+/g,'_');
    const payFrequency = String(row.pay_frequency || 'biweekly').toLowerCase();
    const state = String(row.state || 'US').toUpperCase();

    const annualSalary = toNumber(row.annual_salary);
    const hourlyRate = toNumber(row.hourly_rate);
    const hoursPerWeek = toNumber(row.hours_per_week);
    const bonus = toNumber(row.bonus);
    const pretax401k = toNumber(row['401k']);
    const preTaxCafeteria = toNumber(row.hsa_fsa);
    const postTax = toNumber(row.post_tax_deductions);
    const dependents = toNumber(row.dependents);
    const extraWithholding = toNumber(row.extra_withholding);

    let grossAnnual = annualSalary;
    if (wageType === 'hourly') {
      grossAnnual = hourlyRate * Math.max(hoursPerWeek, 0) * 52;
    }
    grossAnnual += bonus;

    const stdDeduction = STANDARD_DEDUCTION[filingStatus] || STANDARD_DEDUCTION.single;
    const brackets = FEDERAL_BRACKETS[filingStatus] || FEDERAL_BRACKETS.single;
    const taxableFederal = Math.max(0, grossAnnual - pretax401k - preTaxCafeteria - stdDeduction);
    const fedTax = Math.max(0, progressiveTax(taxableFederal, brackets) - (dependents * 2000)) + extraWithholding;

    const socialSecurityWages = Math.max(0, grossAnnual - preTaxCafeteria);
    const socialSecurity = Math.min(socialSecurityWages, 176100) * 0.062;
    const medicare = socialSecurityWages * 0.0145;
    const threshold = (filingStatus === 'married_joint' ? 250000 : filingStatus === 'married_separate' ? 125000 : 200000);
    const additionalMedicare = Math.max(0, socialSecurityWages - threshold) * 0.009;

    const stateRate = STATE_RATES[state] || 0;
    const stateTaxable = Math.max(0, grossAnnual - pretax401k - preTaxCafeteria);
    const stateTax = state === 'US' ? 0 : stateTaxable * stateRate;

    const preTaxTotal = pretax401k + preTaxCafeteria;
    const totalTax = fedTax + socialSecurity + medicare + additionalMedicare + stateTax;
    const netAnnual = Math.max(0, grossAnnual - totalTax - preTaxTotal - postTax);

    const periodCount = PAY_PERIODS[payFrequency] || 1;
    const perPeriodPay = netAnnual / periodCount;

    return {
      employeeName,
      grossAnnual,
      fedTax,
      stateTax,
      socialSecurity,
      medicare,
      additionalMedicare,
      totalTax,
      preTaxTotal,
      postTax,
      netAnnual,
      perPeriodPay,
      payFrequency,
      filingStatus,
      state
    };
  }

  function renderResults(rows) {
    const container = document.getElementById('resultsContainer');
    if (!rows.length) {
      container.innerHTML = '<p class="muted">No rows to display.</p>';
      return;
    }

    const table = `
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Gross</th>
            <th>Federal</th>
            <th>State</th>
            <th>FICA</th>
            <th>Net</th>
            <th>Per Paycheck</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${row.employeeName}</td>
              <td>${currency(row.grossAnnual)}</td>
              <td>${currency(row.fedTax)}</td>
              <td>${currency(row.stateTax)}</td>
              <td>${currency(row.socialSecurity + row.medicare + row.additionalMedicare)}</td>
              <td>${currency(row.netAnnual)}</td>
              <td>${currency(row.perPeriodPay)}<br><span class="compact">${row.payFrequency}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = table;
  }

  function setMessage(msg, type) {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = msg;
    el.className = 'message';
    if (type) el.classList.add(type);
  }

  function processFile(file) {
    if (!file) {
      setMessage('Please choose a CSV file first.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function() {
      try {
        const rows = mapCsvRows(String(reader.result || ''));
        const payrollRows = rows.map(calculatePayrollRow);
        renderResults(payrollRows);
        setMessage('CSV processed successfully. ' + payrollRows.length + ' row(s) calculated.', 'success');
      } catch (err) {
        setMessage(err.message || 'Unable to process the CSV file.', 'error');
      }
    };
    reader.onerror = function() {
      setMessage('The file could not be read.', 'error');
    };
    reader.readAsText(file);
  }

  function downloadCsvFile(filename, content) {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 0);
  }

  function downloadTemplate() {
    const templateRows = [
      [
        'employee_name', 'wage_type', 'annual_salary', 'hourly_rate', 'hours_per_week',
        'state', 'filing_status', 'pay_frequency', '401k', 'hsa_fsa',
        'post_tax_deductions', 'dependents', 'extra_withholding', 'bonus'
      ],
      [
        'Alex Smith', 'salary', '95000', '', '40', 'CA', 'single', 'biweekly',
        '7000', '2500', '0', '0', '0', '0'
      ],
      [
        'Jamie Lee', 'hourly', '', '45', '40', 'TX', 'married_joint', 'semimonthly',
        '5000', '2000', '150', '1', '0', '500'
      ]
    ];

    const template = templateRows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    downloadCsvFile('payroll-template.csv', template);
  }

  document.addEventListener('DOMContentLoaded', function() {
    const processBtn = document.getElementById('processBtn');
    const csvFileInput = document.getElementById('csvFile');
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');

    if (processBtn) {
      processBtn.addEventListener('click', function() {
        const file = csvFileInput && csvFileInput.files && csvFileInput.files[0];
        processFile(file);
      });
    }

    if (csvFileInput) {
      csvFileInput.addEventListener('change', function(e) {
        const file = e.target.files && e.target.files[0];
        if (file) {
          setMessage('File selected: ' + file.name + '. Click “Calculate payroll rows” to process it.', 'success');
        }
      });
    }

    if (downloadTemplateBtn) {
      downloadTemplateBtn.addEventListener('click', downloadTemplate);
    }
  });
})();
