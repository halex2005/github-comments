import React from 'react'
import {IIssueCommentsCountProvider} from "../api/IIssueCommentsCountProvider";
import {observer} from "mobx-react";

interface IProps {
  provider: IIssueCommentsCountProvider,
  issueNumber: string
}

export const GithubCommentsCountView = observer(
  function ({provider, issueNumber}: IProps) {
    const commentInfo = provider.getCommentsCountForIssue(issueNumber)
    return (
      <a href={commentInfo.issueUrl}>{`${commentInfo.totalCount} comments`}</a>
    )
  })
