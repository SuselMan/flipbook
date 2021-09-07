import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from 'react-jss';
import themes from "./configs/theme";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={themes.light}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
