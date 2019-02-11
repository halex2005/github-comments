import React from 'react';
import { observer } from 'mobx-react'
import { GithubAuthenticationProvider } from '../api/GithubAuthenticationProvider'
import './styles.css'

interface IProps {
  provider: GithubAuthenticationProvider
}

const AuthenticatedUser = observer(({provider}: IProps) => {
  return (
    <div className="dropdown">
      <button className="btn btn-secondary dropdown-toggle" type="button" id="authenticated-user-menu" data-toggle="dropdown">
        <img className="current-user-avatar" src={provider.currentUserAvatar} alt={`Logout for ${provider.currentUserName}`}/>
      </button>
      <div className="dropdown-menu" aria-labelledby="authenticated-user-menu">
        <a className="dropdown-item" href={provider.getReviewAccessUrl()} target="_blank">Review app authorization</a>
        <div className="dropdown-divider" />
        <a className="dropdown-item" onClick={() => provider.logout()}>Logout</a>
      </div>
    </div>
  )
})

export const GithubAuthenticationView = observer(function ({ provider }: IProps) {
  if (provider.inProgress) {
    return <div><i className="fa fa-spin fa-spinner fa-fw fa-2x"></i></div>
  }
  return provider.isAuthenticated
    ? <AuthenticatedUser provider={provider} />
    : <a href={provider.getAuthenticationUrl()}>Sign in with GitHub</a>
})
