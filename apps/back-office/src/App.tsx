import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Audit, CashUps, Inventory, StockTake } from './Stock';
import { Departments, Employees, Hardware, Products, Stores } from './Catalog';
import { Dashboard, Reports } from './Reports';

const nav: [string, [string, string][]][] = [
  ['Overview', [['/', 'Dashboard'], ['/reports', 'Sales reports']]],
  ['Catalogue', [['/departments', 'Departments'], ['/products', 'Products']]],
  ['Stock', [['/inventory', 'Inventory'], ['/stock-take', 'Stock take']]],
  ['Operations', [['/cash-ups', 'Cash-ups'], ['/audit', 'Audit trail']]],
  ['Administration', [['/employees', 'Employees'], ['/stores', 'Stores & terminals'], ['/hardware', 'Printers & payments']]],
];

export default function App() {
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">Sync<b>POS</b> <span style={{ fontSize: 12, opacity: .6 }}>Back Office</span></div>
        {nav.map(([g, items]) => (
          <div key={g}><div className="grp">{g}</div>
            {items.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>)}
          </div>
        ))}
      </aside>
      <div className="main">
        <div className="head"><div className="sp" /><span className="muted">Tendai Moyo · <span className="badge">administrator</span></span><button className="btn sm">Sign out</button></div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} /><Route path="/reports" element={<Reports />} />
            <Route path="/departments" element={<Departments />} /><Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} /><Route path="/stock-take" element={<StockTake />} />
            <Route path="/cash-ups" element={<CashUps />} /><Route path="/audit" element={<Audit />} />
            <Route path="/employees" element={<Employees />} /><Route path="/stores" element={<Stores />} />
            <Route path="/hardware" element={<Hardware />} /><Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
