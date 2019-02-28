import React from 'react'
import { observer } from 'mobx-react'
import { GithubAuthenticationProvider } from '../api/GithubAuthenticationProvider'
import './styles.css'

interface IProps {
  provider: GithubAuthenticationProvider;
}

const AuthenticatedUser = observer(({ provider }: IProps) => {
  const userInfo = provider.CurrentUserInfo
  return (
    <div className="dropdown">
      <button className="btn btn-primary navbar-btn dropdown-toggle" type="button" id="authenticated-user-menu" data-toggle="dropdown">
        <div className="auth-info">
          <img className="current-user-avatar" src={userInfo.userAvatar} alt={`Logout for ${userInfo.userLogin}`}/>
          <span style={{ marginLeft: 10 }}>{userInfo.userLogin}</span>
        </div>
      </button>
      <ul className="dropdown-menu" aria-labelledby="authenticated-user-menu">
        <li><a href={userInfo.userUrl} target="_blank" rel="noopener noreferrer">View profile on GitHub</a></li>
        <li><a href={provider.getReviewAccessUrl()} target="_blank" rel="noopener noreferrer">Review app authorization</a></li>
        <li role="separator" className="divider" />
        <li><a onClick={() => provider.logout()}>Logout</a></li>
      </ul>
    </div>
  )
})

const UnauthenticatedUser = observer(({ provider }: IProps) => {
  return (
    <a className="btn btn-primary navbar-btn" type="button" href={provider.getAuthenticationUrl()}>
      <div className="auth-info">
        <i className="fa fa-github fa-2x fa-inverse" />
        <span style={{ marginLeft: 10 }}>Sign in with GitHub</span>
      </div>
    </a>
  )
})

export const GithubAuthenticationView = observer(function({ provider }: IProps) {
  if (provider.InProgress) {
    return (
      <button className="btn btn-primary navbar-btn">
        <i className="fa fa-spin fa-spinner fa-fw fa-2x" />
      </button>
    )
  }
  return provider.IsAuthenticated
    ? <AuthenticatedUser provider={provider} />
    : <UnauthenticatedUser provider={provider} />
})
