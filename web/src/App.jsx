import React from 'react';
import Editor from './components/Editor/Editor';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Activation from './components/Activation/Activation';
import Project from './components/Project/Project';
import EditProject from './components/EditProject/EditProject';
import Feed from './components/Feed/Feed';
import MyProjects from './components/MyProjects/MyProjects';
import Settings from './components/Settings/Settings';
import Hotkeys from './components/Settings/Hotkeys';
import UserProfile from './components/UserProfile/UserProfile';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useStyles } from './App.styles';

const App = (props) => {
  const classes = useStyles();
  return (
      <main className={classes.app}>
            <Router>
                <Header/>
                <Switch>
                    <Route path="/me/settings/hotkeys">
                        <Hotkeys/>
                    </Route>
                    <Route path="/me/settings">
                        <Settings/>
                    </Route>
                    <Route path="/me" exact>
                        <MyProjects/>
                    </Route>
                    <Route path="/profile" exact>
                        <MyProjects/>
                    </Route>
                    <Route path="/user/:username">
                        <UserProfile/>
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
                    <Route path="/editor/draft/:draftId">
                        <Editor/>
                    </Route>
                    <Route path="/editor/:id">
                        <EditProject/>
                    </Route>
                    <Route path="/project/:id">
                        <Project/>
                    </Route>
                    <Route path="/feed/:sort">
                        <Feed/>
                    </Route>
                    <Route path="/feed" exact>
                        <Feed/>
                    </Route>
                    <Route path="/" exact>
                        <Editor/>
                    </Route>
                </Switch>
            </Router>
      </main>
  );
}

export default App;
