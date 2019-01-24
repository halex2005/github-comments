// @ts-ignore
import * as React from 'react'
import {GithubComment} from "./GithubComent"
import {IGithubComment} from "./interfaces"
import axios from 'axios'
import './styles.css'

interface IProps {
  apiRoot: string,
  issueNumber: string,
}

interface IState {
  showLoader: boolean,
  comments: IGithubComment[],
  nextComments: any,
  canShowMoreComments: boolean,
}

export class GithubCommentsView extends React.Component<IProps, IState> {

  public static defaultProps: Partial<IProps> = {
    apiRoot: 'https://codeofclimber.ru/api'
  }

  public state: IState = {
    showLoader: true,
    comments: [],
    nextComments: null,
    canShowMoreComments: false,
  }

  constructor(props: IProps) {
    super(props)
  }

  public componentDidMount() {
    axios.get(this.props.apiRoot + `/page-comments/${this.props.issueNumber}`)
      .then(this.addComments)
  }

  public render(): React.ReactNode {
    return (
      <div>
        <ul className="comments-list">
          {this.state.comments.map(c => <GithubComment comment={c} key={c.id}/>)}
        </ul>
        {this.state.showLoader
          ? (
            <div>
              <i className="fa fa-spin fa-spinner fa-fw fa-2x"/>
              <span className="sr-only">Loading...</span>
            </div>)
          : (this.state.canShowMoreComments ? <button onClick={this.loadMoreComments}>Show more comments</button> : null)
        }
      </div>
    )
  }

  private addComments = (pageCommentsResponse: any) => {
    const response = pageCommentsResponse.data;
    const pageComments = response.data.repository.issue.comments;
    const newComments = this.state.comments.concat(pageComments.nodes.map((comment: any) => ({
      id: comment.id,
      createdAt: new Date(comment.createdAt),
      body: comment.bodyHTML,
      userLogin: comment.author.login,
      userUrl: comment.author.url,
      userAvatar: comment.author.avatarUrl
    })))
    this.setState({
      showLoader: false,
      comments: newComments,
      nextComments: pageComments.pageInfo.endCursor,
      canShowMoreComments: !!pageComments.pageInfo.hasNextPage,
    })
  }

  private loadMoreComments = () => {
    if (this.state.nextComments) {
      this.setState({
        showLoader: true,
      })
      this.state.nextComments.fetch().then(this.addComments)
    }
  }
}
