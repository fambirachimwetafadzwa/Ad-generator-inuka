import React from 'react';
import { createRoot } from 'react-dom/client';
import '@syncpos/shared/src/theme.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
