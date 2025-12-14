// Optymalizator UI (React/TS)
import React, { useState, useEffect } from 'react';

import type { Issue, OptimizerLog } from '../../shared/types/optimizer';

type CategoryConfig = {
  id: string;
  name: string;
  description: string;
  safe: boolean;
  icon: string;
};

const i18n = {
  pl: {
    scan: 'Skanuj', preview: 'Podgląd zmian', clean: 'Wyczyść zaznaczone', restorePoint: 'Utwórz punkt przywracania', restore: 'Przywróć', cancel: 'Anuluj',
    advanced: 'Tryb zaawansowany', showCritical: 'Pokaż tylko krytyczne', showWarnings: 'Pokaż tylko ostrzeżenia', showInfo: 'Pokaż tylko info',
    categories: 'Kategorie', issues: 'Znalezione problemy', progress: 'Postęp', log: 'Log',
    safe: 'Bezpieczne', risky: 'Ryzykowne',
    selectAll: 'Zaznacz wszystko', deselectAll: 'Odznacz wszystko',
  }
};
const lang = 'pl';

export default function OptimizerPage() {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<OptimizerLog[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [filter, setFilter] = useState<'critical'|'warn'|'info'|null>(null);

  useEffect(() => {
    fetch('shared/config/optimizer.config.json').then(r=>r.json()).then(cfg=>setCategories(cfg.categories));
    // TODO: nasłuchuj optimizer.onProgress/onLog
  }, []);

  async function handleScan() {
    setProgress(5);
    const cats = categories.filter(c=>selected.includes(c.id)).map(c=>c.id);
    // @ts-ignore
    if (!window.optimizer) return;
    // @ts-ignore
    const result = await window.optimizer.scan(cats, false);
    setIssues(result.issues);
    setProgress(100);
  }

  return (
    <div className="optimizer-page">
      <h2>Optymalizator</h2>
      <div className="optimizer-controls">
        <button onClick={handleScan}>{i18n[lang].scan}</button>
        <button>{i18n[lang].preview}</button>
        <button>{i18n[lang].clean}</button>
        <button>{i18n[lang].restorePoint}</button>
        <button>{i18n[lang].restore}</button>
        <button>{i18n[lang].cancel}</button>
        <label><input type="checkbox" checked={advanced} onChange={e=>setAdvanced(e.target.checked)} /> {i18n[lang].advanced}</label>
      </div>
      <div className="optimizer-categories">
        <h3>{i18n[lang].categories}</h3>
        {categories.map(cat => (
          <label key={cat.id} title={cat.description} style={{color:cat.safe?'':'#e74c3c'}}>
            <input type="checkbox" checked={selected.includes(cat.id)} onChange={e=>{
              setSelected(sel=>e.target.checked?[...sel,cat.id]:sel.filter(id=>id!==cat.id));
            }} />
            <i className={cat.icon}></i> {cat.name} {cat.safe?`(${i18n[lang].safe})`:`(${i18n[lang].risky})`}
          </label>
        ))}
      </div>
      <div className="optimizer-issues">
        <h3>{i18n[lang].issues}</h3>
        <ul>
          {issues.map(issue => (
            <li key={issue.id} style={{color:issue.safe?'':'#e74c3c'}}>
              <b>{issue.category}</b>: {issue.description} {issue.path || issue.regPath} <span style={{fontSize:'0.9em',color:'#888'}}>({issue.size ? (issue.size/1024/1024).toFixed(2)+' MB' : ''})</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="optimizer-progress">
        <label>{i18n[lang].progress}: {progress}%</label>
        <progress value={progress} max={100}></progress>
      </div>
      <div className="optimizer-log">
        <h4>{i18n[lang].log}</h4>
        <pre style={{maxHeight:200,overflow:'auto'}}>{log.map(l=>`[${l.timestamp}] [${l.level}] ${l.message}`).join('\n')}</pre>
      </div>
    </div>
  );
}
