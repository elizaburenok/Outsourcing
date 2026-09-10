import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '../tokens/css-variables.css';
import './fonts.css';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');
const basename = routerBasename === '' ? undefined : routerBasename;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
