import { useState, type ReactNode } from 'react';

export interface Col<T> { head: string; cell: (r: T) => ReactNode; num?: boolean }

export function Table<T>({ cols, rows, empty = 'Nothing here yet' }: { cols: Col<T>[]; rows: T[]; empty?: string }) {
  return (
    <div className="card tbl">
      <table>
        <thead><tr>{cols.map(c => <th key={c.head} className={c.num ? 'num' : ''}>{c.head}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{cols.map(c => <td key={c.head} className={c.num ? 'num' : ''}>{c.cell(r)}</td>)}</tr>)}
          {!rows.length && <tr><td colSpan={cols.length} className="muted" style={{ textAlign: 'center', padding: 30 }}>{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export const PageTitle = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="page-title"><h1>{title}</h1>{children}</div>
);

export const Stat = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="card stat"><div className="l">{label}</div><div className="v">{value}</div>{note && <div className="d muted">{note}</div>}</div>
);

export const Switch = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button className={`switch ${on ? 'on' : ''}`} onClick={onChange} aria-pressed={on} aria-label="toggle" />
);

export const StatusBadge = ({ on, yes = 'Active', no = 'Inactive' }: { on: boolean; yes?: string; no?: string }) => (
  <span className={`badge ${on ? 'ok' : ''}`}>{on ? yes : no}</span>
);

export type Field = { key: string; label: string; type?: 'text' | 'number' | 'select' | 'password'; options?: { value: string; label: string }[] };

export function FormModal({ title, fields, initial, onSave, onClose }: {
  title: string; fields: Field[]; initial: Record<string, string>; onSave: (v: Record<string, string>) => void; onClose: () => void;
}) {
  const [v, setV] = useState(initial);
  const ok = fields.every(f => (v[f.key] ?? '') !== '');
  return (
    <div className="overlay"><div className="card modal">
      <h2>{title}</h2>
      <div className="form">
        {fields.map(f => (
          <div key={f.key}>
            <label>{f.label}</label>
            {f.type === 'select'
              ? <select className="input" value={v[f.key] ?? ''} onChange={e => setV({ ...v, [f.key]: e.target.value })}>
                  <option value="" disabled>Select…</option>{f.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              : <input className="input" type={f.type ?? 'text'} step="any" value={v[f.key] ?? ''} onChange={e => setV({ ...v, [f.key]: e.target.value })} />}
          </div>
        ))}
      </div>
      <div className="row"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!ok} onClick={() => onSave(v)}>Save</button></div>
    </div></div>
  );
}
