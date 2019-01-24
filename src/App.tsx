import * as React from 'react';
import './App.css';
import {GithubCommentsView} from "./components/GithubCommentsView";

import logo from './logo.svg';
import { GithubIssueCommentsProvider } from './api/GithubIssueCommentsProvider';

class App extends React.Component {
  provider: GithubIssueCommentsProvider

  constructor(props: any) {
    super(props)
    this.provider = new GithubIssueCommentsProvider({
      apiRoot: "http://localhost:4000",
      issueNumber: 1
    })
    this.provider.loadMoreComments()
  }

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
        <GithubCommentsView provider={this.provider}/>
      </div>
    );
  }
}

export default App;
