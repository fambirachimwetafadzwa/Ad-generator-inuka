import { useState } from 'react';

export function PinPad({ onSubmit, length = 4 }: { onSubmit: (pin: string) => void; length?: number }) {
  const [pin, setPin] = useState('');
  const press = (d: string) => {
    const next = pin + d;
    if (next.length > length) return;
    if (next.length === length) { setPin(''); onSubmit(next); } else setPin(next);
  };
  return (
    <div>
      <div className="pin-dots">{Array.from({ length }, (_, i) => <i key={i} className={i < pin.length ? 'f' : ''} />)}</div>
      <div className="pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => <button key={d} onClick={() => press(d)}>{d}</button>)}
        <button onClick={() => setPin('')}>C</button>
        <button onClick={() => press('0')}>0</button>
        <button onClick={() => setPin(p => p.slice(0, -1))}>⌫</button>
      </div>
    </div>
  );
}
