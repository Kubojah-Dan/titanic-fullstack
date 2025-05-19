import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AxiosError } from 'axios';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.post('/signup', { email, password });
      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        const errorMessage = (error.response.data as { detail?: string })?.detail || 'Server error';
        setError('Registration failed: ' + errorMessage);
      } else if (error.request) {
        setError('Registration failed: Unable to reach the server. Please check if the backend is running.');
      } else {
        setError('Registration failed: ' + error.message);
      }
      console.error('Signup error:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Sign Up
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
          Sign Up
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Already have an account?{' '}
        <Link to="/login">Login</Link>
      </Typography>
    </Box>
  );
}