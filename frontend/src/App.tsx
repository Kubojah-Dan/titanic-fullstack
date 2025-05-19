import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PredictionForm from './components/PredictionForm';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PredictionHistory from './components/PredictionHistory';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { AppThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="predict" element={<PredictionForm />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="history" element={<PredictionHistory />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppThemeProvider>
  );
}

export default App;