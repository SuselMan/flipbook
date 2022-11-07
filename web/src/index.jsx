import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from 'react-jss';
import themes from "./configs/theme";
import { RecoilRoot } from 'recoil';

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
        <ThemeProvider theme={localStorage.theme === 'light' ? themes.light: themes.dark}>
          <App />
        </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);
