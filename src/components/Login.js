import React, { useState } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import { Button, Form, Grid, Segment, Message } from 'semantic-ui-react'
import { useAuth } from './AuthContext'
import { dominoApi } from '../util/DominoApi'
import { handleLogError } from '../util/Helpers'

function Login() {
  const Auth = useAuth()
  const isLoggedIn = Auth.userIsAuthenticated()

  const [username, setUsername] = useState('')
  const [isError, setIsError] = useState(false)

  const handleInputChange = (e, { name, value }) => {
    if (name === 'username') {
      setUsername(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username) {
      setIsError(true)
      return
    }

    try {
      const response = await dominoApi.authenticate(username, username)
      const authenticatedUser = response.data

      Auth.userLogin(authenticatedUser)
      Auth.getUserProfile()

      setUsername('')
      setIsError(false)
    } catch (error) {
      handleLogError(error)
      setIsError(true)
    }
  }

  if (isLoggedIn) {
    return <Navigate to={'/'} />
  }

  return (
    <Grid textAlign='center'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Form size='large' onSubmit={handleSubmit}>
          <Segment>
            <Form.Input
              fluid
              autoFocus
              name='username'
              icon='user'
              iconPosition='left'
              placeholder='Имя'
              value={username}
              onChange={handleInputChange}
            />
            <Button color='blue' fluid size='large'>Вход</Button>
          </Segment>
        </Form>
        <Message>{`Хотите зарегистрироваться? `}
          <NavLink to="/signup" as={NavLink} color='teal'>Регистрация</NavLink>
        </Message>
        {isError && <Message negative>Пользователь не найден</Message>}
      </Grid.Column>
    </Grid>
  )
}

export default Login