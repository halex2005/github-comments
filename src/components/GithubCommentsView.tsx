// @ts-ignore
import * as React from 'react'
import { observer } from 'mobx-react'
import {GithubComment} from "./GithubComent"
import './styles.css'
import { GithubIssueCommentsProvider } from '../api/GithubIssueCommentsProvider';
import { CallbackOnVisibleOnce } from './CallbackOnVisibleOnce';

interface IProps {
  provider: GithubIssueCommentsProvider
}

export const GithubCommentsView = observer(
  (props: IProps) => {
    return (
      <CallbackOnVisibleOnce trigger={props.provider.loadMoreComments}>
        <ul className="comments-list">
          {props.provider.Comments.map(c => <GithubComment comment={c} key={c.id}/>)}
        </ul>
        {props.provider.FetchInProgress
          ? (
            <div>
              <i className="fa fa-spin fa-spinner fa-fw fa-2x"/>
              <span className="sr-only">Loading...</span>
            </div>
          )
          : (props.provider.CanShowMoreComments
            ? <button onClick={props.provider.loadMoreComments}>Show more comments</button>
            : null)
        }
      </CallbackOnVisibleOnce>
    )
  })
