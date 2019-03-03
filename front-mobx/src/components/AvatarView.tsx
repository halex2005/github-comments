import * as React from 'react'
import { IUserInfo } from './interfaces'

export const AvatarView: React.FC<{ userInfo: IUserInfo }> = ({ userInfo }) => (
  <div className="avatar-container">
    <a href={userInfo.userUrl} rel="nofollow">
      <img src={userInfo.userAvatar} alt={userInfo.userLogin} className="avatar"/>
    </a>
  </div>
)
