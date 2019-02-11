import * as React from 'react';
import './App.css';
import {GithubCommentsView} from "./components/GithubCommentsView";

import { GithubIssueCommentsProvider } from './api/GithubIssueCommentsProvider';

class App extends React.Component {
  provider: GithubIssueCommentsProvider

  constructor(props: any) {
    super(props)
    this.provider = new GithubIssueCommentsProvider({
      apiRoot: "http://localhost:4000",
      issueNumber: "1"
    })
    this.provider.loadMoreComments()
  }

  public render() {
    return (
      <div className="App">
        <GithubCommentsView provider={this.provider}/>
      </div>
    );
  }
}

export default App;
