/* Styles for the dashboard demo */
:root{--bg:#f7fafc;--card:#fff;--accent:#0b69ff;--muted:#6b7280;--radius:8px}
*{box-sizing:border-box}
body{font-family:Inter,system-ui,Segoe UI,Roboto,'Helvetica Neue',Arial;background:var(--bg);margin:0;color:#111}
.app{display:flex;min-height:100vh}
.sidebar{width:220px;background:#0f1724;color:#fff;padding:20px;display:flex;flex-direction:column}
.sidebar h2{margin:0 0 12px;font-size:18px}
.nav-btn{display:block;width:100%;text-align:left;padding:8px 10px;margin:6px 0;border:none;background:transparent;color:rgba(255,255,255,0.9);border-radius:6px;cursor:pointer}
.nav-btn.active, .nav-btn:hover{background:rgba(255,255,255,0.06)}
.sidebar-foot{margin-top:auto;font-size:12px;opacity:0.8}
.main{flex:1;padding:24px}
.main-header{display:flex;align-items:center}
.main-header h1{margin:0;font-size:20px}
.main-actions{margin-left:auto;display:flex;gap:8px}
.btn{background:var(--accent);color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer}
.btn.ghost{background:transparent;border:1px solid rgba(0,0,0,0.06);color:#111}
.card{background:var(--card);border-radius:var(--radius);padding:16px;box-shadow:0 1px 2px rgba(16,24,40,0.04);margin-bottom:12px}
.grid{display:grid;grid-template-columns:1fr 320px;gap:12px}
.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.form-actions{margin-top:12px;display:flex;gap:8px}
.form-card h3{margin-top:0}
.hidden{display:none}
.output-card pre{margin:0;white-space:pre-wrap}
.output-card{min-height:120px}
@media(max-width:800px){.grid{grid-template-columns:1fr}.sidebar{display:none}.app{flex-direction:column}.main{padding:12px}}
