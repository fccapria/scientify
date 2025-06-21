import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box, 
  Container, 
  IconButton,
  Tooltip 
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import UploadModal from "./UploadModal";
import { useTheme } from "../context/ThemeContext";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function Header({ onUploadSuccess }) {
  const [openUpload, setOpenUpload] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    if (onUploadSuccess) {
      onUploadSuccess();
    }
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <AppBar 
            position="static" 
            sx={{ 
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backdropFilter: 'blur(20px)',
              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}
          >
            <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
              {/* Clickable logo */}
              <Button
                onClick={() => navigate('/')}
                sx={{
                  textTransform: 'none',
                  padding: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  🔬 Scientify
                </Typography>
              </Button>

              <Box display="flex" alignItems="center" gap={1}>
                {/* Toggle Dark Mode */}
                <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
                  <IconButton 
                    onClick={toggleDarkMode}
                    sx={{ 
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>

                {/* Upload Button */}
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setOpenUpload(true)}
                  sx={{ 
                    ml: 1,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
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
                  Upload
                </Button>
                
                <UserMenu />
              </Box>
            </Toolbar>
          </AppBar>
        </Container>
      </Box>
      <UploadModal 
        open={openUpload} 
        onClose={() => setOpenUpload(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}