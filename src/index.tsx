import React from 'react';
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);