// @ts-ignore
import * as Octokat from 'octokat'
import * as React from 'react'
import {GithubComment} from "./GithubComent";
import {IGithubComment} from "./interfaces";
import './styles.css'

interface IProps {
  apiRoot: string,
  owner: string,
  repository: string,
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
    apiRoot: 'https://api.github.com'
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
    const octo = new Octokat({
      rootURL: this.props.apiRoot,
      acceptHeader: 'application/vnd.github.v3.html+json'
    })
    octo.repos(this.props.owner, this.props.repository)
      .issues(this.props.issueNumber)
      .comments
      .fetch()
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

  private addComments = (comments: any) => {
    const newComments = this.state.comments.concat(comments.items.map((comment: any) => ({
      id: comment.id,
      createdAt: comment.createdAt,
      body: comment.bodyHtml || comment.body,
      userLogin: comment.user.login,
      userUrl: comment.user.htmlUrl,
      userAvatar: comment.user.avatarUrl
    })))
    this.setState({
      showLoader: false,
      comments: newComments,
      nextComments: comments.nextPage,
      canShowMoreComments: !!comments.nextPage,
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
