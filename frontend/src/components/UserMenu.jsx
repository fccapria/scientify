import { useState } from "react";
import { Button, Menu, MenuItem, Avatar, Typography, Box, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginDialog from "./LoginDialog";
import LoginIcon from '@mui/icons-material/Login';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const { token, logout, userInfo, loading } = useAuth();
  const navigate = useNavigate();

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Function to get display name
  const getDisplayName = () => {
    if (!userInfo) return "User";

    // If has first and last name, show those
    if (userInfo.first_name && userInfo.last_name) {
      return `${userInfo.first_name} ${userInfo.last_name}`;
    }

    // If has only first name
    if (userInfo.first_name) {
      return userInfo.first_name;
    }

    // Otherwise show email (or part of it)
    if (userInfo.email) {
      return userInfo.email.split('@')[0];
    }

    return "User";
  };

  // Initials for avatar
  const getInitials = () => {
    if (!userInfo) return "U";

    if (userInfo.first_name && userInfo.last_name) {
      return `${userInfo.first_name.charAt(0)}${userInfo.last_name.charAt(0)}`.toUpperCase();
    }

    if (userInfo.first_name) {
      return userInfo.first_name.charAt(0).toUpperCase();
    }

    if (userInfo.email) {
      return userInfo.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  return (
    <>
    {!token ? (
      // Login button when not logged in
      <Button
      variant="contained"
      startIcon={<LoginIcon />}
      onClick={() => setLoginOpen(true)}
      sx={{
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(255,255,255,0.2)',
               color: 'white',
               '&:hover': {
                 backgroundColor: 'rgba(255,255,255,0.25)',
               transform: 'translateY(-2px)',
               boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
               },
               fontWeight: 'bold',
               textTransform: 'none',
               transition: 'all 0.3s ease'
      }}
      >
      Login
      </Button>
    ) : (
      // Button with name when logged in
      <Button
      onClick={handleMenu}
      endIcon={<ExpandMoreIcon />}
      disabled={loading}
      sx={{
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
         backdropFilter: 'blur(10px)',
         border: '1px solid rgba(255,255,255,0.2)',
         color: 'white',
         '&:hover': {
           backgroundColor: 'rgba(255,255,255,0.25)',
         },
         textTransform: 'none',
         transition: 'all 0.3s ease',
         maxWidth: '220px',
         '&.Mui-disabled': {
           backgroundColor: 'rgba(255,255,255,0.1)',
         color: 'rgba(255,255,255,0.7)',
         }
      }}
      >
      <Box display="flex" alignItems="center" gap={1}>
      <Avatar sx={{
        width: 28,
         height: 28,
         fontSize: '0.75rem',
         bgcolor: 'rgba(255,255,255,0.3)',
         color: 'white'
      }}>
      {getInitials()}
      </Avatar>
      <Typography
      variant="body2"
      sx={{
        overflow: 'hidden',
         textOverflow: 'ellipsis',
         whiteSpace: 'nowrap',
         maxWidth: '140px',
         fontWeight: 500
      }}
      >
      {loading ? "Loading..." : getDisplayName()}
      </Typography>
      </Box>
      </Button>
    )}

    {/* Dropdown menu for logged in user */}
    <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    PaperProps={{
      sx: {
        mt: 1,
        borderRadius: 2,
        minWidth: 200,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }
    }}
    >
    {/* User info in menu */}
    {userInfo && (
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" fontWeight="bold" color="text.primary">
      {getDisplayName()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
      {userInfo.email}
      </Typography>
      </Box>
    )}

    <MenuItem
    onClick={() => {
      navigate("/me");
      handleClose();
    }}
    sx={{ gap: 1.5, py: 1.5 }}
    >
    <MenuBookIcon fontSize="small" />
    My publications
    </MenuItem>

    <MenuItem
    onClick={() => {
      logout();
      handleClose();
    }}
    sx={{ gap: 1.5, py: 1.5, color: 'error.main' }}
    >
    <LogoutIcon fontSize="small" />
    Logout
    </MenuItem>
    </Menu>

    {/* Login dialog */}
    <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}