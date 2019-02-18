import React from 'react';
import { observer } from 'mobx-react'
import { GithubAuthenticationProvider } from '../api/GithubAuthenticationProvider'
import './styles.css'

interface IProps {
  provider: GithubAuthenticationProvider
}

const AuthenticatedUser = observer(({provider}: IProps) => {
  const userInfo = provider.currentUserInfo
  return (
    <div className="dropdown">
      <button className="btn btn-primary navbar-btn dropdown-toggle" type="button" id="authenticated-user-menu" data-toggle="dropdown">
        <img className="current-user-avatar" src={userInfo.userAvatar} alt={`Logout for ${userInfo.userLogin}`}/>
        {' '}
        <span>{userInfo.userLogin}</span>
      </button>
      <ul className="dropdown-menu" aria-labelledby="authenticated-user-menu">
        <li><a href={userInfo.userUrl} target="_blank">View profile on GitHub</a></li>
        <li><a href={provider.getReviewAccessUrl()} target="_blank">Review app authorization</a></li>
        <li role="separator" className="divider" />
        <li><a onClick={() => provider.logout()}>Logout</a></li>
      </ul>
    </div>
  )
})

const UnauthenticatedUser = observer(({ provider }: IProps) => {
  return (
    <a className="btn btn-primary navbar-btn" type="button" href={provider.getAuthenticationUrl()}>
      <div style={{display: 'flex', alignItems: 'center', fontSize: '1.25em'}}>
        <i className="fa fa-github fa-2x fa-inverse" />
        <span style={{marginLeft: 10}}>Sign in with GitHub</span>
      </div>
    </a>
  )
})

export const GithubAuthenticationView = observer(function ({ provider }: IProps) {
  if (provider.inProgress) {
    return <div><i className="fa fa-spin fa-spinner fa-fw fa-2x"></i></div>
  }
  return provider.isAuthenticated
    ? <AuthenticatedUser provider={provider} />
    : <UnauthenticatedUser provider={provider} />
})
