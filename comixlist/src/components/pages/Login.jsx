import React, { useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import LoginForm from '../loginCadastro/LoginForm';
import styles from './Login.module.css'
import Footer from '../layout/Footer'

function Login() {
  return (
    <div className={styles.login_container}>
      <h1>Faça o Login</h1>
      <LoginForm btnText="Login" />
      <Footer />
    </div>
  )
}

export default Login;
