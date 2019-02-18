import * as React from 'react'
import {IGithubUserInfo} from "./interfaces";

export function AvatarView({ userInfo }: { userInfo: IGithubUserInfo }) {
  return (
    <div className="avatar-container">
      <a href={userInfo.userUrl} rel="nofollow">
        <img src={userInfo.userAvatar} alt={userInfo.userLogin} className="avatar"/>
      </a>
    </div>
  )
}
