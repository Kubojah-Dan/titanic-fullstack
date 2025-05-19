import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Create form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2PasswordRequestForm expects 'username'
    formData.append('password', password);

    try {
      const res = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const { access_token } = res.data; // Match backend response field
      login(access_token);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        const errorMessage = (error.response.data as { detail?: string })?.detail || 'Server error';
        setError('Login failed: ' + errorMessage);
      } else if (error.request) {
        setError('Login failed: Unable to reach the server. Please check if the backend is running.');
      } else {
        setError('Login failed: ' + error.message);
      }
      console.error('Login error:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Don't have an account?{' '}
        <Link to="/signup">Sign Up</Link>
      </Typography>
    </Box>
  );
}