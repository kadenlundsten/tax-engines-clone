<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Spreadsheet Upload Payroll Calculator</title>
  <style>
    :root { --bg:#f4f7fb; --panel:#fff; --text:#172033; --muted:#58657d; --border:#dfe9f4; --accent:#1d4ed8; --accent-soft:#edf3ff; --danger:#b42318; --success:#166534; --success-soft:#f0fdf4; --shadow:rgba(17,24,39,.08); }
    *{box-sizing:border-box}
    body{margin:0;font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--text);line-height:1.5}
    .wrap{max-width:1100px;margin:0 auto;padding:0 1rem}
    header{background:#fff;border-bottom:1px solid var(--border);box-shadow:0 4px 16px rgba(15,23,42,.03)}
    .brand-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 0}
    .brand{font-size:1.25rem;font-weight:700}
    nav{display:flex;flex-wrap:wrap;gap:1rem}
    a{color:var(--accent);text-decoration:none}
    a:hover{text-decoration:underline}
    main{padding:2rem 0 4rem}
    .card{background:var(--panel);border:1px solid var(--border);border-radius:18px;padding:1.25rem;box-shadow:0 12px 30px var(--shadow)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
    label{display:block;font-weight:700;font-size:.9rem;margin-bottom:.45rem}
    input, textarea, select, button{font:inherit}
    input[type="file"], input[type="number"], select{width:100%;padding:.8rem .9rem;border:1px solid var(--border);border-radius:10px;background:#fff}
    .actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem}
    button{border:none;border-radius:10px;padding:.8rem 1.1rem;font-weight:700;cursor:pointer}
    .primary{background:var(--accent);color:#fff}
    .secondary{background:var(--accent-soft);color:var(--accent)}
    .muted{color:var(--muted)}
    .message{margin-top:1rem;padding:.9rem 1rem;border-radius:10px;border:1px solid var(--border);background:#f9fafb}
    .message.error{border-color:#fecaca;background:#fff1f2;color:var(--danger)}
    .message.success{border-color:#bbf7d0;background:#f0fdf4;color:var(--success)}
    table{width:100%;border-collapse:collapse;margin-top:1rem;background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden}
    th, td{padding:.8rem .6rem;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}
    th{background:#f8fbff}
    .compact{font-size:.85rem;color:var(--muted)}
    .template-box{margin-top:1rem;padding:1rem;border:1px dashed var(--border);border-radius:12px;background:#f8fbff}
    .template-box h3{margin:0 0 .5rem;font-size:1rem}
    .template-preview{overflow:auto;margin-top:.75rem}
    .template-preview table{margin-top:0}
    pre{white-space:pre-wrap;overflow:auto;background:#fff;border:1px solid var(--border);padding:1rem;border-radius:10px;margin:0}
    @media (max-width:700px){.brand-row{flex-direction:column;align-items:flex-start}.nav{width:100%}}
  </style>
</head>
<body>
  <header>
    <div class="wrap brand-row">
      <div class="brand">Spreadsheet Upload Payroll</div>
      <nav aria-label="Main navigation">
        <a href="../">Home</a>
        <a href="../paycheck-calculator/">Paycheck</a>
        <a href="../bonus-tax-calculator/">Bonus</a>
      </nav>
    </div>
  </header>

  <main>
    <div class="wrap">
      <section class="card">
        <h1>Upload payroll CSV</h1>

        <div class="grid">
          <div>
            <label for="csvFile">CSV file</label>
            <input id="csvFile" type="file" accept=".csv,text/csv" />
          </div>
        </div>

        <div class="actions">
          <button id="processBtn" class="primary" type="button">Calculate payroll rows</button>
          <button id="downloadTemplateBtn" class="secondary" type="button">Download sample CSV</button>
          <button id="downloadResultsBtn" class="secondary" type="button" style="display:none;">Download calculated CSV</button>
        </div>

        <div id="message" class="message" aria-live="polite">Upload a CSV file to begin.</div>

        <div class="template-box">
          <h3>Sample spreadsheet layout</h3>
          <div class="compact">Required CSV columns (case-insensitive and flexible names):</div>
          <div id="templatePreview" class="template-preview"></div>
          <div class="compact" style="margin-top:.8rem;">Tip: Excel users can type these headers into the first row and add one employee per row below it.</div>
        </div>
      </section>

      <section class="card" style="margin-top:1.25rem;">
        <h2>Calculation results</h2>
        <div id="resultsContainer"></div>
      </section>
    </div>
  </main>

  <script src="../assets/spreadsheet-uploader.js"></script>
</body>
</html>
