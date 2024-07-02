import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Link,
  Navigate,
  Outlet,
} from 'react-router-dom';
import {
  User, AIPlayer, Playline, Stock, UserOnline, OpponentPlayer, StockOnline, PlaylineOnline
} from './components'
import { PageContainer, MenuContainer, NavContainer } from './components/styled'
import { useAuth, AuthProvider } from './components/AuthContext'
import PrivateRoute from './util/PrivateRoute'
import Login from './components/Login'

export default function App() {
  useEffect(() => {
  }, []);

  return (
    <AuthProvider>
      <Router>
        <MyMenu />
        <Routes>
          <Route path="/" element={<Public />} />
          <Route path="/ai" element={<PrivateRoute><PrivateAI /></PrivateRoute>} />
          <Route path="online" element={<PrivateRoute><PrivateOnline /></PrivateRoute>} />
          <Route path="tournament" element={<PrivateRoute><PrivateTournament /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function Public() {
  return (
    <>
      <MenuContainer>
        <Link to="/online">Играть онлайн</Link>
        <Link to="/ai">Играть с ИИ</Link>
        <Link to="/tournament">Турнир</Link>
      </MenuContainer>
    </>
  );
}

function PrivateAI() {
  return (
    <>
      <PageContainer>
        <Stock />
        <AIPlayer />
        <Playline />
        <User />
      </PageContainer>
    </>
  );
}

function PrivateOnline() {
  return (
    <>
      <PageContainer>
        <StockOnline />
        <OpponentPlayer />
        <PlaylineOnline />
        <UserOnline />
      </PageContainer>
    </>
  );
}

function PrivateTournament() {
  return (
    <>
      <PageContainer>
      </PageContainer>
    </>
  );
}

function MyMenu() {
  const auth = useAuth();
  return (
    <NavContainer>
      <Link to="/">Домой - {auth.userName}</Link>
    </NavContainer>
  );
}
