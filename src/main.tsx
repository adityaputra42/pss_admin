import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Matches Vite's `base` (see vite.config.ts) -- when this app is served
// under a sub-path by a reverse proxy (e.g. /admin/ during the ngrok/
// nginx demo gateway setup), both need to agree or client-side
// navigation and asset URLs diverge. Defaults to root for local/direct
// deployment, where there's no sub-path.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
