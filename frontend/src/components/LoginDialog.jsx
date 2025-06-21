import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  IconButton,
  Stack,
  Divider,
  Tabs,
  Tab,
  Chip
} from "@mui/material";
import { login, register } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import { InputAdornment } from "@mui/material";

export default function LoginDialog({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = Login, 1 = Register
  const { setToken } = useAuth();

  const isLogin = tabValue === 0;
  const isRegister = tabValue === 1;

  async function handleLogin() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = await login({ email, password });
      setToken(token);
      setSuccess("Login successful!");
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      setSuccess("🎉 Registration complete! You can now log in.");
      setTimeout(() => {
        setTabValue(0);
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error during registration");
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setError("");
    setSuccess("");
    setTabValue(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setSuccess("");
  };

  return (
    <Dialog
    open={open}
    onClose={handleClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 4,
        overflow: 'hidden'
      }
    }}
    >
    <DialogTitle sx={{
      pb: 1,
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider'
    }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center" gap={1}>
    {isLogin ? <LoginIcon color="primary" /> : <PersonAddIcon color="primary" />}
    <Typography variant="h6" fontWeight="bold">
    Welcome to Scientify
    </Typography>
    </Box>
    <IconButton onClick={handleClose} size="small">
    <CloseIcon />
    </IconButton>
    </Box>
    </DialogTitle>

    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
    <Tabs value={tabValue} onChange={handleTabChange} centered>
    <Tab
    label="Login"
    icon={<LoginIcon />}
    iconPosition="start"
    sx={{ textTransform: 'none', fontWeight: 'bold' }}
    />
    <Tab
    label="Register"
    icon={<PersonAddIcon />}
    iconPosition="start"
    sx={{ textTransform: 'none', fontWeight: 'bold' }}
    />
    </Tabs>
    </Box>

    <DialogContent sx={{ py: 3 }}>
    <Stack spacing={3}>
    <Box textAlign="center">
    {isLogin ? (
      <Typography variant="body2" color="text.secondary">
      Enter your credentials to access your account
      </Typography>
    ) : (
      <Stack spacing={1} alignItems="center">
      <Typography variant="body2" color="text.secondary">
      Create a new account to upload your publications
      </Typography>
      <Chip
      label="Free • Fast • Secure"
      size="small"
      color="primary"
      variant="outlined"
      />
      </Stack>
    )}
    </Box>

    {/* First and Last Name (only for registration) */}
    {isRegister && (
      <Box display="flex" gap={2}>
      <TextField
      label="First Name"
      value={firstName}
      onChange={e => setFirstName(e.target.value)}
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
          <PersonIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        }
      }}
      />
      <TextField
      label="Last Name"
      value={lastName}
      onChange={e => setLastName(e.target.value)}
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
          <PersonIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        }
      }}
      />
      </Box>
    )}

    <TextField
    label="Email"
    type="email"
    value={email}
    onChange={e => setEmail(e.target.value)}
    fullWidth
    variant="outlined"
    required
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
        <EmailIcon color="action" />
        </InputAdornment>
      ),
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
      }
    }}
    />

    <TextField
    label="Password"
    type="password"
    value={password}
    onChange={e => setPassword(e.target.value)}
    fullWidth
    variant="outlined"
    required
    helperText={isRegister ? "Minimum 6 characters" : ""}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
        <LockIcon color="action" />
        </InputAdornment>
      ),
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
      }
    }}
    />

    {isRegister && (
      <TextField
      label="Confirm Password"
      type="password"
      value={confirmPassword}
      onChange={e => setConfirmPassword(e.target.value)}
      fullWidth
      variant="outlined"
      required
      error={confirmPassword && password !== confirmPassword}
      helperText={confirmPassword && password !== confirmPassword ? "Passwords do not match" : ""}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
          <LockIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        }
      }}
      />
    )}

    {error && (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
      {error}
      </Alert>
    )}

    {success && (
      <Alert severity="success" sx={{ borderRadius: 2 }}>
      {success}
      </Alert>
    )}
    </Stack>
    </DialogContent>

    <Divider />

    <DialogActions sx={{ p: 3, gap: 2 }}>
    <Button
    onClick={handleClose}
    variant="outlined"
    size="large"
    sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
    >
    Cancel
    </Button>

    {isLogin ? (
      <Button
      onClick={handleLogin}
      variant="contained"
      disabled={loading || !email || !password}
      size="large"
      startIcon={<LoginIcon />}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        minWidth: 120,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
      >
      {loading ? "Logging in..." : "Login"}
      </Button>
    ) : (
      <Button
      onClick={handleRegister}
      variant="contained"
      disabled={loading || !email || !password || !confirmPassword || password !== confirmPassword}
      size="large"
      startIcon={<PersonAddIcon />}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        minWidth: 120,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }}
      >
      {loading ? "Registering..." : "Register"}
      </Button>
    )}
    </DialogActions>
    </Dialog>
  );
}