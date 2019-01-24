import * as React from 'react';
import './App.css';
import {GithubCommentsView} from "./components/GithubCommentsView";

import logo from './logo.svg';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <GithubCommentsView apiRoot="http://localhost:4000" issueNumber="1"/>
      </div>
    );
  }
}

export default App;
