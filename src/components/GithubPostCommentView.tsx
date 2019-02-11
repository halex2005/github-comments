import React from 'react'
import { GithubAuthenticationProvider } from '../api/GithubAuthenticationProvider';
import { observer } from 'mobx-react';
import './styles.css'

interface IProps {
  authProvider: GithubAuthenticationProvider
}

export const GithubPostCommentView = observer(function ({ authProvider }: IProps) {
  //TODO:
  // - вывести логотип юзера и ссылку на его профиль слева от поля ввода
  // - непосредственно постинг комментария
  // - превью markdown?
  if (authProvider.isAuthenticated) {
    return (
      <div className="post-comment-container">
        <textarea></textarea>
        <div>
          <button className="btn btn-success">Post comment</button>
        </div>
      </div>
    )
  }
  else {
    return null
  }
})
