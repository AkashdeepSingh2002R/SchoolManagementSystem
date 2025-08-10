import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import users from '../data/users';
import styles from './Login.module.css';

function Login() {
  const[email,setEmail]= useState("");
  const[password,setPassword]= useState("");
  const[role,setRole]=useState("");
  const[error,setError]=useState("")
  function handleEmail(e){
    setEmail(e.target.value)
  }
  function handlePassword(e){
    setPassword(e.target.value)
  }
  function handleRole(e){
    setRole(e.target.value)
  }
   const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const matchedUser = users.find(
      (user) =>
        user.email === email &&
        user.password === password &&
        user.role === role
    );

    if (matchedUser) {
      // store user data
      localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));

      // redirect to role-based dashboard
      navigate(`/${role}`);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  }
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>Login</h1>
        <form>
                    {error && <p className={styles.error}>{error}</p>}

          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" placeholder="Enter your email" onChange={handleEmail}  />

          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" placeholder="Enter your password"onChange={handlePassword} />

          <label htmlFor="role">Role</label>
          <select name="role" id="role" onChange={handleRole}>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>

          <button type="submit" onClick={handleSubmit}>Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
