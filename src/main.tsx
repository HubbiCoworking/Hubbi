import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyA11y, loadA11y } from './lib/a11y';
import './styles/tokens.css';

// Antes do primeiro desenho, para a página já abrir com o tamanho e o contraste escolhidos.
applyA11y(loadA11y());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
