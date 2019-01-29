import React from 'react'
import {IGithubCommentInfo, IIssueCommentsCountProvider} from "../api/IIssueCommentsCountProvider";
import {observer} from "mobx-react";

interface IProps {
  provider: IIssueCommentsCountProvider,
  commentInfo: IGithubCommentInfo
}

export const GithubCommentsCountView = observer(
  function ({provider, commentInfo}: IProps) {
    return (
      <a href={commentInfo.issueUrl}>{`${commentInfo.totalCount} comments`}</a>
    )
  })
