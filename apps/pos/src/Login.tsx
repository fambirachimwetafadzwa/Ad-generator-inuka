import { useState } from 'react';
import { employees, stores, terminals, type Employee } from '@syncpos/shared';
import { PinPad } from './PinPad';

export function Login({ terminalId, onLogin }: { terminalId: string; onLogin: (e: Employee) => void }) {
  const terminal = terminals.find(t => t.id === terminalId)!;
  const store = stores.find(s => s.id === terminal.storeId)!;
  const staff = employees.filter(e => e.storeId === store.id && e.active && e.role !== 'administrator');
  const [sel, setSel] = useState<Employee | null>(null);
  const [err, setErr] = useState('');

  return (
    <div className="login">
      <div className="card login-card">
        <div className="left">
          <div className="logo">Sync<b>POS</b></div>
          <div>
            <h2 style={{ margin: 0 }}>{store.name}</h2>
            <div style={{ opacity: .85 }}>{terminal.name} · {terminal.id}</div>
          </div>
          <small style={{ opacity: .7 }}>Demo PINs — Manager 1111 · Cashier 2222 / 3333</small>
        </div>
        <div className="right">
          <h3 style={{ marginTop: 0 }}>Who's signing in?</h3>
          <div className="users">
            {staff.map(e => (
              <button key={e.id} className={`user ${sel?.id === e.id ? 'active' : ''}`} onClick={() => { setSel(e); setErr(''); }}>
                {e.name}<span className="badge">{e.role}</span>
              </button>
            ))}
          </div>
          {sel && <PinPad onSubmit={pin => (pin === sel.pin ? onLogin(sel) : setErr('Incorrect PIN, try again'))} />}
          {err && <div className="err" style={{ textAlign: 'center' }}>{err}</div>}
        </div>
      </div>
    </div>
  );
}
