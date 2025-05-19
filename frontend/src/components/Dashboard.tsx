import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

interface Prediction {
  id: number;
  result: string;
  probability: string;
  date: string;
}

interface Stats {
  total: number;
  accuracy: number;
}

interface SurvivalRate {
  category: string;
  rate: number;
}


// Define the shape of FastAPI error responses
interface FastAPIErrorResponse {
  detail?: string;
}

interface PredictionCounts {
  survived: number;
  notSurvived: number;
}

const PredictionSummary = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, accuracy: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats({
          total: response.data.total_predictions || 0,
          accuracy: response.data.model_accuracy || 0,
        });
        setLoading(false);
      } catch (err: unknown) {
        const error = err as AxiosError;
        setError(
          error.response?.status === 401
            ? 'Unauthorized: Please log in again'
            : error.response?.status === 404
            ? 'Stats endpoint not found'
            : 'Failed to load summary stats'
        );
        setStats({ total: 150, accuracy: 85 }); // Fallback to static data
        setLoading(false);
        console.error('PredictionSummary error:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Prediction Summary</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Typography>Total Predictions: {stats.total}</Typography>
          <Typography>Model Accuracy: {stats.accuracy}%</Typography>
        </>
      )}
    </Box>
  );
};

const RecentPredictions: React.FC<{
  setPredictionCounts: React.Dispatch<React.SetStateAction<PredictionCounts>>;
  refreshTrigger: number;
}> = ({ setPredictionCounts, refreshTrigger }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchPredictions = useCallback(async () => {
    if (!token) {
      setError('Please log in to view recent predictions.');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await api.get('/predictions'); // Token handled by interceptor
      const fetchedPredictions = response.data.map((p: any, index: number) => ({
        id: p.id || index,
        result: p.result === 'Survived' ? 'Yes' : 'No',
        probability: p.probability
          ? (parseFloat(p.probability) * 100).toFixed(2)
          : '0.00',
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
      }));
      setPredictions(fetchedPredictions);

      // Calculate Survived and Not Survived counts
      const survivedCount = fetchedPredictions.filter(
        (p: Prediction) => p.result === 'Yes'
      ).length;
      const notSurvivedCount = fetchedPredictions.length - survivedCount;
      setPredictionCounts({ survived: survivedCount, notSurvived: notSurvivedCount });

      setLoading(false);
    } catch (err: unknown) {
        const error = err as AxiosError<FastAPIErrorResponse>;
        const message =
          error.response?.data && 'detail' in error.response.data
            ? error.response.data.detail
            : 'Unknown error';
      setError('Failed to fetch predictions: ' + (message || 'Unknown error'));
      setLoading(false);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      console.error('RecentPredictions error:', error);
    }
  }, [token, navigate, setPredictionCounts]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions, refreshTrigger]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'result', headerName: 'Survived', width: 150 },
    { field: 'probability', headerName: 'Probability (%)', width: 150 },
    { field: 'date', headerName: 'Date', width: 200 },
  ];

  return (
    <Box sx={{ height: 400 }}>
      <Typography variant="h6" gutterBottom>Recent Predictions</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <DataGrid
          rows={predictions}
          columns={columns}
          pageSizeOptions={[5]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          disableRowSelectionOnClick
        />
      )}
    </Box>
  );
};

const PredictionChart: React.FC<{ predictionCounts: PredictionCounts }> = ({
  predictionCounts,
}) => {
  const survivalRates = [
    { category: 'Female', rate: 74 },
    { category: 'Male', rate: 19 },
    { category: '1st Class', rate: 63 },
    { category: '2nd Class', rate: 47 },
    { category: '3rd Class', rate: 24 },
  ];

  const categories = [
    ...survivalRates.map((rate) => rate.category),
    'Survived',
    'Not Survived',
  ];
  const survivalData = [
    ...survivalRates.map((rate) => rate.rate),
    0,
    0,
  ];
  const predictionData = [
    ...survivalRates.map(() => 0),
    predictionCounts.survived,
    predictionCounts.notSurvived,
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Model Analysis & Prediction Outcomes
      </Typography>
      <BarChart
        xAxis={[{ scaleType: 'band', data: categories }]}
        series={[
          { data: survivalData, label: 'Survival Rate (%)', color: '#6a1b9a' },
          { data: predictionData, label: 'Prediction Count', color: '#9575cd' },
        ]}
        height={300}
      />
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [predictionCounts, setPredictionCounts] = useState<PredictionCounts>({
    survived: 0,
    notSurvived: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of predictions
  const handlePredictionMade = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
          Titanic Survival Predictor Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              <PredictionSummary />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              <PredictionChart predictionCounts={predictionCounts} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              <RecentPredictions
                setPredictionCounts={setPredictionCounts}
                refreshTrigger={refreshTrigger}
              />
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/predict"
            onClick={handlePredictionMade} // Trigger refresh when navigating to predict
          >
            Make a Prediction
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/history"
          >
            View Prediction History
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/settings"
          >
            Settings
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Dashboard;