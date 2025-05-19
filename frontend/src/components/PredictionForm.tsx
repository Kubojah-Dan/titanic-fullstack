import React, { useState } from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, Slider, TextField, Typography, SelectChangeEvent } from '@mui/material';

interface FormData {
  pclass: number;
  sex: string;
  age: number;
  embarked: string;
  sibsp: number;
  parch: number;
  fare: number;
}

const PredictionForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    pclass: 1,
    sex: 'male',
    age: 30,
    embarked: 'S',
    sibsp: 0,
    parch: 0,
    fare: 50,
  });

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

  return (
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
    </Grid>
  );
};

export default PredictionForm;