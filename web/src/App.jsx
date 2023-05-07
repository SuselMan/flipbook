import React from 'react';
import Editor from './components/Editor/Editor';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Activation from './components/Activation/Activation';
import { BrowserRouter as Router, Switch, Route, useLocation} from "react-router-dom";
import { useStyles } from './App.styles';

const App = (props) => {
  const classes = useStyles();
  return (
      <main className={classes.app}>
            <Router>
                <Header/>
                <Switch>
                    <Route path="/profile">
                        <div>
                            Profile
                        </div>
                    </Route>
                    <Route path="/login">
                        <Login/>
                    </Route>
                    <Route path="/register">
                        <Register/>
                    </Route>
                    <Route path="/activation/:id">
                        <Activation/>
                    </Route>
                    <Route path="/">
                        <Editor/>
                    </Route>
                </Switch>
            </Router>
      </main>
  );
}

export default App;
