import axios from 'axios'

export const dominoApi = {
  authenticate,
  signup,
  profile
}

function authenticate(username, password) {
  return instance.post('/auth/login', { username, password }, {
    headers: { 'Content-type': 'application/json' }
  })
}

function signup(user) {
  return instance.post('/auth/signup', user, {
    headers: { 'Content-type': 'application/json' }
  })
}

function profile(user) {
  return instance.get('auth/profile', {
    headers: { 'Authorization': basicAuth(user) }
  })
}

// -- Axios

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_HOST
})

// -- Helper functions

function basicAuth(user) {
  return `Bearer ${user.access_token}`
}