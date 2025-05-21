import React, { useState, FormEvent } from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, Slider, TextField, Typography, SelectChangeEvent, Button, Alert, Card, CardContent } from '@mui/material';
import { LiveHelpOutlined } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

interface FormData {
  pclass: number;
  sex: string;
  age: number;
  embarked: string;
  sibsp: number;
  parch: number;
  fare: number;
}

interface PredictionResult {
  result: string;
  probability: number;
}

interface ErrorResponse {
  detail?: string;
}

const PredictionForm: React.FC = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    pclass: 1,
    sex: 'male',
    age: 30,
    embarked: 'S',
    sibsp: 0,
    parch: 0,
    fare: 50,
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (name === 'pclass') {
      setFormData((prev) => ({ ...prev, pclass: parseInt(value) }));
    } else if (name === 'sex' || name === 'embarked') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setFormData((prev) => ({ ...prev, fare: newValue as number }));
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!token) {
      setError('Please log in to make a prediction.');
      return;
    }

    try {
      const response = await api.post('/predict', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(response.data);
    } catch (err: unknown) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.detail || 'Unknown error';
      setError('Failed to get prediction: ' + errorMessage);
      console.error(error);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          <LiveHelpOutlined sx={{ mr: 1 }} />
          Survival Prediction Form
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Passenger Class</InputLabel>
                <Select
                  name="pclass"
                  value={formData.pclass.toString()}
                  onChange={handleChange}
                  label="Passenger Class"
                >
                  <MenuItem value="1">First Class</MenuItem>
                  <MenuItem value="2">Second Class</MenuItem>
                  <MenuItem value="3">Third Class</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="sex" value={formData.sex} onChange={handleChange} label="Gender">
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleNumberChange}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Embarked</InputLabel>
                <Select
                  name="embarked"
                  value={formData.embarked}
                  onChange={handleChange}
                  label="Embarked"
                >
                  <MenuItem value="C">Cherbourg</MenuItem>
                  <MenuItem value="Q">Queenstown</MenuItem>
                  <MenuItem value="S">Southampton</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Siblings/Spouse"
                name="sibsp"
                type="number"
                value={formData.sibsp}
                onChange={handleNumberChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parents/Children"
                name="parch"
                type="number"
                value={formData.parch}
                onChange={handleNumberChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Fare (£)</Typography>
              <Slider
                value={formData.fare}
                onChange={handleSliderChange}
                min={0}
                max={500}
                step={1}
                valueLabelDisplay="auto"
                sx={{ width: '95%', mx: 'auto' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Predict Survival
              </Button>
            </Grid>

            {result && (
              <Grid item xs={12}>
                <Alert
                  severity={result.result === 'Survived' ? 'success' : 'error'}
                  sx={{ fontSize: '1.1rem' }}
                >
                  <Typography variant="h6">
                    {result.result === 'Survived' ? 'High Survival Chance' : 'Low Survival Chance'}
                  </Typography>
                  <Typography variant="body2">
                    Probability: {(result.probability * 100).toFixed(2)}%
                  </Typography>
                </Alert>
              </Grid>
            )}

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default PredictionForm;