import React from 'react';
import Editor from './components/Editor/Editor';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useStyles } from './App.styles';

const App = (props) => {
  const classes = useStyles();
  return (
      <main className={classes.app}>
            <Router>
              <Header/>
              <Editor/>
            </Router>
      </main>
  );
}

export default App;
