import { BarChart } from '@mui/x-charts';
import { Card, Typography } from '@mui/material';

export default function StatsChart() {
  return (
    <Card sx={{ mt: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Historical Survival Rates
      </Typography>
      <BarChart
        xAxis={[{ 
          scaleType: 'band', 
          data: ['Female', 'Male', '1st Class', '2nd Class', '3rd Class'] 
        }]}
        series={[{ data: [74, 19, 63, 47, 24] }]}
        height={300}
      />
    </Card>
  );
}