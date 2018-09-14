import * as React from 'react'
import {IGithubComment} from "./interfaces";

export function AvatarView({ comment }: { comment: IGithubComment }) {
  return (
    <div className="avatar-container">
      <a href={comment.userUrl} rel="nofollow">
        <img src={comment.userAvatar} alt={comment.userLogin} className="avatar"/>
      </a>
    </div>
  )
}
