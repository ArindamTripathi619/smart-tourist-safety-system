import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  AccountCircle,
  People,
  Security,
  Analytics,
  Refresh,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService, User, AlertStats, EmergencyAlert } from '../services/api';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats>({
    totalAlerts: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    lastAlert: null
  });
  const [recentAlerts, setRecentAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    fetchUsers();
    fetchAlertStats();
    fetchRecentAlerts();
    
    // Set up auto-refresh for real-time updates
    const interval = setInterval(() => {
      fetchAlertStats();
      fetchRecentAlerts();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      
      if (response.success && response.users) {
        setUsers(response.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err: any) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertStats = async () => {
    try {
      const response = await apiService.getAlertStats();
      
      if (response.success && response.stats) {
        setAlertStats(response.stats);
      }
    } catch (err: any) {
      console.error('Failed to fetch alert stats:', err);
      // Don't show error for alert stats as it's not critical
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      const response = await apiService.getEmergencyAlerts();
      
      if (response.success && response.alerts) {
        setRecentAlerts(response.alerts.slice(0, 5)); // Show only last 5 alerts
      }
    } catch (err: any) {
      console.error('Failed to fetch recent alerts:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const refreshData = () => {
    fetchUsers();
    fetchAlertStats();
    fetchRecentAlerts();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'police': return 'warning';
      case 'tourist': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  const getEmergencyTypeInfo = (emergencyType?: string) => {
    const types: { [key: string]: { label: string; icon: string; color: string } } = {
      'panic': { label: 'General Emergency', icon: '🚨', color: '#e74c3c' },
      'medical': { label: 'Medical Emergency', icon: '🏥', color: '#e67e22' },
      'accident': { label: 'Accident', icon: '🚗', color: '#d35400' },
      'theft': { label: 'Theft/Robbery', icon: '🔓', color: '#f39c12' },
      'harassment': { label: 'Harassment', icon: '⚠️', color: '#e74c3c' },
      'lost': { label: 'Lost/Stranded', icon: '🧭', color: '#9b59b6' },
      'natural_disaster': { label: 'Natural Disaster', icon: '🌪️', color: '#c0392b' },
      'fire': { label: 'Fire Emergency', icon: '🔥', color: '#e74c3c' },
      'violence': { label: 'Violence/Assault', icon: '🛡️', color: '#8e44ad' },
      'suspicious_activity': { label: 'Suspicious Activity', icon: '👁️', color: '#f39c12' },
      'transport': { label: 'Transport Issue', icon: '🚌', color: '#3498db' },
      'other': { label: 'Other Emergency', icon: '📞', color: '#7f8c8d' },
    };
    return types[emergencyType || 'other'] || types['other'];
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL': return '#c0392b';
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🛡️ Smart Tourist Safety - Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={refreshData} startIcon={<Refresh />}>
            Refresh
          </Button>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(event) => setAnchorEl(event.currentTarget)}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* Stats Cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography variant="body2">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => u.role === 'tourist').length}
                  </Typography>
                  <Typography variant="body2">Tourists</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Analytics sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{alertStats.activeAlerts}</Typography>
                  <Typography variant="body2">Active Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText', flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{alertStats.totalAlerts}</Typography>
                  <Typography variant="body2">Total Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Emergency Alerts Section */}
        {alertStats.activeAlerts > 0 && (
          <Card sx={{ mb: 3, bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                🚨 Active Emergency Alerts ({alertStats.activeAlerts})
              </Typography>
              {recentAlerts.filter(alert => alert.status === 'ACTIVE').map((alert) => {
                const emergencyInfo = getEmergencyTypeInfo(alert.emergencyType);
                return (
                  <Box key={alert.alertId} sx={{ 
                    bgcolor: '#ffcdd2', 
                    p: 2, 
                    mb: 1, 
                    borderRadius: 1,
                    border: '1px solid #f44336'
                  }}>
                    <Typography variant="subtitle2" color="error" fontWeight="bold">
                      {emergencyInfo.icon} {emergencyInfo.label} - Tourist ID: {alert.digitalId}
                    </Typography>
                    {alert.priority && (
                      <Chip
                        label={alert.priority}
                        size="small"
                        sx={{ 
                          bgcolor: getPriorityColor(alert.priority),
                          color: 'white',
                          fontSize: '10px',
                          height: '20px',
                          mt: 0.5
                        }}
                      />
                    )}
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Message:</strong> {alert.message}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Location:</strong> {alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(alert.timestamp)}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      sx={{ ml: 2, mt: 1 }}
                      onClick={() => {
                        window.open(`https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`, '_blank');
                      }}
                    >
                      View on Map
                    </Button>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Recent Alerts Summary */}
        {recentAlerts.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Recent Emergency Alerts (Last 5)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tourist ID</TableCell>
                      <TableCell>Emergency Type</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAlerts.map((alert) => {
                      const emergencyInfo = getEmergencyTypeInfo(alert.emergencyType);
                      return (
                        <TableRow key={alert.alertId}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {alert.digitalId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ marginRight: '8px' }}>{emergencyInfo.icon}</span>
                              <Typography variant="body2" sx={{ color: emergencyInfo.color, fontWeight: 'bold' }}>
                                {emergencyInfo.label}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {alert.priority && (
                              <Chip 
                                label={alert.priority} 
                                size="small"
                                sx={{
                                  bgcolor: getPriorityColor(alert.priority),
                                  color: 'white',
                                  fontSize: '11px'
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {alert.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={alert.status} 
                              color={alert.status === 'ACTIVE' ? 'error' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(alert.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                window.open(`https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`, '_blank');
                              }}
                            >
                              Map
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Registered Users & Tourists
            </Typography>
            
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Digital ID</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Registered</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No users found. Register some users via the API first.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>{user.name[0]}</Avatar>
                            <Box>
                              <Typography variant="subtitle2">{user.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {user.digitalId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={getRoleColor(user.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Demo Info */}
        {users.length > 0 && (
          <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧪 Demo Mode Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This dashboard is connected to your working backend API. 
                Digital IDs are being generated automatically for each user.
                In production, this would connect to MongoDB for persistent storage.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
