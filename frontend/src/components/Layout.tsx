import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const drawerWidth = 240;

export default function Layout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Titanic Survival Predictor
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {[
              { text: 'Dashboard', path: '/' },
              { text: 'Predict', path: '/predict' },
              { text: 'History', path: '/history' },
              { text: 'Settings', path: '/settings' },
              { text: 'Login', path: '/login' },
              { text: 'Sign Up', path: '/signup' },
            ].map((item) => (
              <ListItem key={item.text} component={RouterLink} to={item.path}>
                <ListItemText primary={item.text} sx={{ color: '#ffffff' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  );
}