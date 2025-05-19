import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function Settings() {
  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 8 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>User Settings</Typography>
        <Typography>Settings page under construction.</Typography>
      </CardContent>
    </Card>
  );
}