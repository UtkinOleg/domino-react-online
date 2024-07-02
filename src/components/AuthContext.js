import React, { createContext, useContext, useState, useEffect } from 'react'
import { dominoApi } from '../util/DominoApi'

const AuthContext = createContext()

function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null)
  const [userName, setUserName] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    getUserProfile()
    setUserToken(storedUser)
  }, [])

  const getUserToken = () => {
    return JSON.parse(localStorage.getItem('user'))
  }

  const userIsAuthenticated = () => {
    return localStorage.getItem('user') !== null
  }

  const getUserProfile = async () => {
    try {
      const data = await dominoApi.profile(userIsAuthenticated() ? getUserToken() : { access_token: null })
      setUserName(data.data.username)
      setUserId(data.data.sub)
    } catch (error) {
      userLogout()
    }
  }

  const userLogin = user => {
    localStorage.setItem('user', JSON.stringify(user))
    setUserToken(user)
  }

  const userLogout = () => {
    localStorage.removeItem('user')
    setUserToken(null)
    setUserName(null)
    setUserId(null)
  }

  const contextValue = {
    userToken,
    userName,
    userId,
    getUserToken,
    userIsAuthenticated,
    userLogin,
    userLogout,
    getUserProfile
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

export function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider }