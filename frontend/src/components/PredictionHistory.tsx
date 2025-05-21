import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Button } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { HistoryOutlined } from '@mui/icons-material';
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
      const row = params.row as Prediction;
      const { pclass, sex, age, sibsp, parch, fare, embarked } = row;
      return `Pclass: ${pclass ?? 'N/A'}, Sex: ${sex ?? 'N/A'}, Age: ${age ?? 'N/A'}, SibSp: ${sibsp ?? 'N/A'}, Parch: ${parch ?? 'N/A'}, Fare: ${fare ?? 'N/A'}, Embarked: ${embarked ?? 'N/A'}`;
    },
  },
  {
    field: 'created_at',
    headerName: 'Date (IST)',
    width: 200,
    valueFormatter: ({ value }: { value: string }) =>
      value
        ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : 'N/A',
  },
];

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchPredictions = () => {
    if (!token) {
      setError('Please log in to view prediction history');
      setLoading(false);
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get('/predictions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('Predictions response:', res.data);
        const existingIds = new Set<number>();
        const mappedPredictions = res.data.map((p: any, index: number) => {
          let uniqueId = p.id;
          // Ensure unique ID by incrementing if duplicate
          while (uniqueId && existingIds.has(uniqueId)) {
            uniqueId++;
          }
          // If no ID or after resolving duplicates, use index as fallback
          const finalId = uniqueId || index + 1;
          existingIds.add(finalId);
          return {
            id: finalId,
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
          };
        });
        console.log('Mapped predictions:', mappedPredictions);
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
  };

  useEffect(() => {
    fetchPredictions();
  }, [token, navigate]);

  return (
    <Card sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryOutlined sx={{ mr: 1 }} />
          Prediction History
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchPredictions}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : predictions.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4 }}>
            No predictions yet. Make a prediction to see your history here.
          </Typography>
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