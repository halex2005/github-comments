import React from 'react'
import {IIssueCommentsCountProvider} from "../api/IIssueCommentsCountProvider";
import {observer} from "mobx-react";

interface IProps {
  provider: IIssueCommentsCountProvider,
  issueNumber: string,
  commentsLink: string
}

export const GithubCommentsCountView = observer(
  function ({provider, issueNumber, commentsLink}: IProps) {
    const commentInfo = provider.getCommentsCountForIssue(issueNumber)

    return provider.FetchInProgress
      ? <a href={commentsLink}>comments</a>
      : <a href={commentsLink}>{`${commentInfo.totalCount} comments`}</a>
  })
