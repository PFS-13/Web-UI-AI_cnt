// src/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');


    window.location.href = `http://localhost:3001/auth/google?email=${encodeURIComponent(email)}`;

    // try {
    //   const response = await axios.post('http://localhost:3001/auth/login', {
    //     email,
    //     password,
    //   });

    //   if (response.data.access_token) {
    //     localStorage.setItem('token', response.data.access_token);
    //     setMessage('Login berhasil! Token: ' + response.data.access_token);
    //   }
    // } catch (error: any) {
    //   setMessage(error.response?.data?.message || 'Login gagal');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>

        {message && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '4px',
              backgroundColor: message.includes('berhasil') ? '#d4edda' : '#f8d7da',
              color: message.includes('berhasil') ? '#155724' : '#721c24',
              border: `1px solid ${
                message.includes('berhasil') ? '#c3e6cb' : '#f5c6cb'
              }`,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
            }}
          >
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
            }}
          >
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div> */}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            marginBottom: '0.75rem',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Tombol Login dengan Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#db4437',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        >
          Login dengan Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ color: '#666' }}>Belum punya akun? </span>
          <Link
            to="/register"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Daftar di sini
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
