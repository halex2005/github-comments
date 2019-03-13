import { GithubAuthenticationProvider } from './GithubAuthenticationProvider'

jest.mock('axios')
import axios from 'axios'

describe('github authentication provider', () => {
  let storageSetItemSpy = null
  let storageRemoveItemSpy = null
  let provider = null
  const providerOptions = { apiRoot: '', clientId: 'clientId-value' }

  beforeEach(() => {
    storageSetItemSpy = jest.spyOn(Storage.prototype, 'setItem')
    storageRemoveItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
    provider = new GithubAuthenticationProvider(providerOptions)
  })

  afterEach(() => {
    storageSetItemSpy.mockRestore()
    storageRemoveItemSpy.mockRestore()
  })

  describe('initial state checks', () => {
    it('should be unauthenticated', () => {
      expect(provider.FetchInProgress).toEqual(false)
      expect(provider.IsAuthenticated).toBeFalsy()
      expect(provider.AccessToken).toEqual('')
      expect(provider.CurrentUserInfo.userLogin).toEqual('')
      expect(provider.CurrentUserInfo.userUrl).toEqual('')
      expect(provider.CurrentUserInfo.userAvatar).toEqual('')
    })
  })

  describe('get access token in progress', () => {
    beforeAll(() => {
      axios.get.mockReturnValue(new Promise(() => {}))
    })

    afterAll(() => {
      axios.get.mockReset()
    })

    beforeEach(() => {
      provider.getAccessToken('code-value')
    })

    it('network call should be made', () => {
      expect(axios.get.call).toHaveLength(1)
    })

    it('user should not be authenticated', () => {
      expect(provider.FetchInProgress).toEqual(true)
      expect(provider.IsAuthenticated).toEqual(false)
    })

    it('subsequent get access token should be rejected', () => {
      return expect(provider.getAccessToken('another-code-value'))
        .rejects.toThrowError('fetch already in progress')
    })
  })

  describe('get access token success', function() {
    const expectedOAuthInfo = {
      accessToken: 'access-token-value',
      userLogin: 'user-login',
      userUrl: 'user-url',
      userAvatar: 'user-avatar',
    }

    beforeAll(() => {
      axios.get.mockResolvedValue({
        status: 200,
        data: expectedOAuthInfo,
      })
    })

    afterAll(() => {
      axios.get.mockReset()
    })

    beforeEach(() => {
      return provider.getAccessToken('code-value')
    })

    it('network call should be made', () => {
      expect(axios.get.call).toHaveLength(1)
    })

    it('user should be authenticated', () => {
      expect(provider.FetchInProgress).toEqual(false)
      expect(provider.IsAuthenticated).toBeTruthy()
      expect(provider.AccessToken).toEqual(expectedOAuthInfo.accessToken)
      expect(provider.CurrentUserInfo.userLogin).toEqual(expectedOAuthInfo.userLogin)
      expect(provider.CurrentUserInfo.userUrl).toEqual(expectedOAuthInfo.userUrl)
      expect(provider.CurrentUserInfo.userAvatar).toEqual(expectedOAuthInfo.userAvatar)
    })

    it('user credentials should be saved in local storage', () => {
      expect(storageSetItemSpy).toHaveBeenCalled()
    })

    it('new provider should retrieve current authentication status from local storage and be authenticated', () => {
      const newProvider = new GithubAuthenticationProvider(providerOptions)
      expect(newProvider.FetchInProgress).toBeFalsy()
      expect(newProvider.IsAuthenticated).toBeTruthy()
      expect(provider.AccessToken).toEqual(expectedOAuthInfo.accessToken)
      expect(provider.CurrentUserInfo.userLogin).toEqual(expectedOAuthInfo.userLogin)
      expect(provider.CurrentUserInfo.userUrl).toEqual(expectedOAuthInfo.userUrl)
      expect(provider.CurrentUserInfo.userAvatar).toEqual(expectedOAuthInfo.userAvatar)
    })

    describe('logout', () => {
      beforeEach(() => {
        provider.logout()
      })

      it('should be unauthenticated', () => {
        expect(provider.IsAuthenticated).toEqual(false)
        expect(provider.AccessToken).toEqual('')
        expect(provider.CurrentUserInfo.userLogin).toEqual('')
        expect(provider.CurrentUserInfo.userUrl).toEqual('')
        expect(provider.CurrentUserInfo.userAvatar).toEqual('')
      })

      it('user credentials should be removed from local storage', () => {
        expect(storageRemoveItemSpy).toHaveBeenCalled()
      })
    })
  })
})
