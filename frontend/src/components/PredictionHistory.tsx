import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

interface Prediction {
  id: number;
  result: string;
  probability: number;
  pclass: number;
  sex: string;
  age: number;
  sibsp: number;
  parch: number;
  fare: number;
  embarked: string;
  created_at: string;
}

interface ErrorResponse {
  detail?: string;
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'result', headerName: 'Survived', width: 150 },
  {
    field: 'probability',
    headerName: 'Probability (%)',
    width: 150,
    valueFormatter: ({ value }: { value: number }) => `${(value * 100).toFixed(2)}`,
  },
  {
    field: 'input_data',
    headerName: 'Input Data',
    width: 300,
    valueGetter: (params: GridRenderCellParams<any, Prediction>) => {
      if (!params.row) {
        console.warn('Row is undefined:', params);
        return 'N/A';
      }
      const { pclass, sex, age, sibsp, parch, fare, embarked } = params.row;
      return `Pclass: ${pclass ?? 'N/A'}, Sex: ${sex ?? 'N/A'}, Age: ${age ?? 'N/A'}, SibSp: ${sibsp ?? 'N/A'}, Parch: ${parch ?? 'N/A'}, Fare: ${fare ?? 'N/A'}, Embarked: ${embarked ?? 'N/A'}`;
    },
  },
  {
    field: 'created_at',
    headerName: 'Date',
    width: 200,
    valueFormatter: ({ value }: { value: string }) => (value ? new Date(value).toLocaleString() : 'N/A'),
  },
];

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Please log in to view prediction history');
      setLoading(false);
      navigate('/login');
      return;
    }

    api
      .get('/predictions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('Predictions response:', res.data);
        const mappedPredictions = res.data.map((p: any, index: number) => ({
          id: p.id || index + 1,
          result: p.result,
          probability: p.probability,
          pclass: p.pclass,
          sex: p.sex,
          age: p.age,
          sibsp: p.sibsp,
          parch: p.parch,
          fare: p.fare,
          embarked: p.embarked,
          created_at: p.created_at,
        }));
        setPredictions(mappedPredictions);
        setLoading(false);
      })
      .catch((err: AxiosError<ErrorResponse>) => {
        const errorMessage = err.response?.data?.detail || 'Unknown error';
        setError('Failed to fetch predictions: ' + errorMessage);
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
        console.error(err);
      });
  }, [token, navigate]);

  return (
    <Card sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Prediction History
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={predictions}
              columns={columns}
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}