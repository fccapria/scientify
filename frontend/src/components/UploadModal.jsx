import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Typography,
  Stack,
  Button,
  Alert,
  Divider,
  LinearProgress,
  Paper,
  Grid
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import PublishIcon from '@mui/icons-material/Publish';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from "../context/AuthContext";

import config from '../config';

export default function UploadModal({ open, onClose, onUploadSuccess }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "",
    authors: "",
    year: "",
    journal: "",
    doi: "", // ADDED DOI FIELD
  });
  const [file, setFile] = useState(null);
  const [bibtex, setBibtex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleBibtexChange = (e) => setBibtex(e.target.files[0]);

  // 🎯 NEW LOGIC: Determine if fields are required
  const fieldsRequired = !bibtex; // If no bibtex, fields are required
  const isFormValid = fieldsRequired
  ? (form.title && form.authors && form.year && form.journal) // Case 1: all fields required
  : true; // Case 2: with bibtex, fields not required

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setResult({ error: "You must be logged in to upload publications" });
      return;
    }

    // 🎯 CUSTOM VALIDATION
    if (!file) {
      setResult({ error: "You must select a document to upload" });
      return;
    }

    if (fieldsRequired && !isFormValid) {
      setResult({ error: "Fill in all required fields or upload a BibTeX file" });
      return;
    }

    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    if (bibtex) formData.append("bibtex", bibtex);

    // 🎯 CONDITIONAL FIELD SENDING: only if filled or required
    if (form.title || fieldsRequired) formData.append("title", form.title);
    if (form.authors || fieldsRequired) formData.append("authors", form.authors);
    if (form.year || fieldsRequired) formData.append("year", form.year);
    if (form.journal || fieldsRequired) formData.append("journal", form.journal);
    if (form.doi) formData.append("doi", form.doi); // ADDED DOI

    try {

      const uploadUrl = `${config.API_URL}/upload/`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setResult({ error: "Unauthorized. Please login to upload publications." });
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        setResult({ error: errorData.detail || "Error during upload" });
        return;
      }

      const data = await res.json();
      setResult(data);

      // Auto-close and reload after success
      setTimeout(() => {
        resetForm();
        onClose();
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        window.location.reload();
      }, 2000);

    } catch (err) {
      setResult({ error: "Connection error during upload" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", authors: "", year: "", journal: "", doi: "" }); // ADDED DOI
    setFile(null);
    setBibtex(null);
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // If user is not logged in, show warning message
  const isDisabled = !token;

  return (
    <Dialog
    open={open}
    onClose={handleClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 4,
        overflow: 'hidden',
        // 🔧 FIX: Limit maximum height and enable scroll
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }
    }}
    >
    <DialogTitle sx={{
      pb: 1.5, // 🔧 FIX: Reduced padding
      background: isDisabled
      ? 'linear-gradient(135deg, rgba(245, 101, 101, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          // 🔧 FIX: Prevent title from resizing
          flexShrink: 0
    }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center" gap={1}>
    {isDisabled ? <LockIcon color="error" fontSize="small" /> : <CloudUploadIcon color="primary" fontSize="small" />}
    <Typography variant="h6" fontWeight="bold" fontSize="1.1rem">
    Upload a new publication
    </Typography>
    </Box>
    <IconButton onClick={handleClose} size="small">
    <CloseIcon fontSize="small" />
    </IconButton>
    </Box>
    </DialogTitle>

    {loading && <LinearProgress sx={{ flexShrink: 0 }} />}

    <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    {/* 🔧 FIX: DialogContent with scroll enabled */}
    <DialogContent sx={{
      py: 2, // 🔧 FIX: Reduced vertical padding
      flex: 1,
      overflow: 'auto', // 🔧 FIX: Enable automatic scroll
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
        '&:hover': {
          background: '#a1a1a1'
        }
      }
    }}>
    <Stack spacing={2}> {/* 🔧 FIX: Reduced spacing from 3 to 2 */}
    {/* Warning for users not logged in */}
    {isDisabled && (
      <Alert
      severity="warning"
      icon={<LockIcon fontSize="small" />}
      sx={{
        borderRadius: 2,
        py: 1, // 🔧 FIX: Reduced padding
        '& .MuiAlert-message': {
          fontSize: '0.8rem' // 🔧 FIX: Reduced font size
        }
      }}
      >
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom fontSize="0.85rem">
      🔒 Login required
      </Typography>
      <Typography variant="body2" fontSize="0.75rem">
      To upload publications you must be registered and logged in.
      Click the user icon in the top right to login or register.
      </Typography>
      </Alert>
    )}

    {/* 🎯 NEW: Dynamic information about requirements */}
    {!isDisabled && (
      <Alert
      severity="info"
      icon={<InfoIcon fontSize="small" />}
      sx={{
        borderRadius: 2,
        py: 1, // 🔧 FIX: Reduced padding
        '& .MuiAlert-message': {
          fontSize: '0.8rem' // 🔧 FIX: Reduced font size
        }
      }}
      >
      {bibtex ? (
        <Box>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom fontSize="0.85rem">
        📋 BibTeX mode active
        </Typography>
        <Typography variant="body2" fontSize="0.75rem">
        You have uploaded a BibTeX file. Metadata will be automatically extracted from the BibTeX file, and the fields below become optional.
        </Typography>
        </Box>
      ) : (
        <Box>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom fontSize="0.85rem">
        📝 Manual mode active
        </Typography>
        <Typography variant="body2" fontSize="0.75rem">
        Fill in all fields below or upload a BibTeX file for automatic metadata extraction.
        </Typography>
        </Box>
      )}
      </Alert>
    )}

    {/* Upload Files Section */}
    <Paper
    variant="outlined"
    sx={{
      p: 2, // 🔧 FIX: Reduced padding from 3 to 2
      borderRadius: 3,
      borderStyle: 'dashed',
      borderWidth: 2,
      bgcolor: isDisabled ? 'action.disabledBackground' : 'background.default',
      borderColor: isDisabled ? 'action.disabled' : 'primary.main',
      opacity: isDisabled ? 0.6 : 1,
      '&:hover': {
        borderColor: isDisabled ? 'action.disabled' : 'primary.main',
        bgcolor: isDisabled ? 'action.disabledBackground' : 'primary.50'
      }
    }}
    >
    <Stack spacing={1.5}> {/* 🔧 FIX: Reduced spacing */}
    <Typography
    variant="subtitle2"
    fontWeight="bold"
    color={isDisabled ? "text.disabled" : "primary"}
    fontSize="0.9rem" // 🔧 FIX: Reduced font size
    >
    📁 File to upload
    </Typography>

    <Button
    variant="outlined"
    component="label"
    startIcon={<DescriptionIcon fontSize="small" />}
    size="medium" // 🔧 FIX: Changed from large to medium
    disabled={isDisabled}
    sx={{
      borderRadius: 2,
      borderStyle: 'dashed',
      py: 1.5, // 🔧 FIX: Reduced padding
      textTransform: 'none',
      fontSize: '0.85rem' // 🔧 FIX: Reduced font size
    }}
    >
    {file ? `📄 ${file.name}` : "Select PDF/DOCX/LaTeX document *"}
    <input
    type="file"
    name="file"
    accept=".pdf,.docx,.tex,.latex"
    hidden
    disabled={isDisabled}
    onChange={handleFileChange}
    />
    </Button>

    <Button
    variant="outlined"
    component="label"
    startIcon={<UploadFileIcon fontSize="small" />}
    size="medium" // 🔧 FIX: Changed from large to medium
    disabled={isDisabled}
    sx={{
      borderRadius: 2,
      borderStyle: 'dashed',
      py: 1.5, // 🔧 FIX: Reduced padding
      textTransform: 'none',
      fontSize: '0.85rem', // 🔧 FIX: Reduced font size
      // 🎯 Highlight BibTeX if loaded
      borderColor: bibtex ? 'success.main' : undefined,
      backgroundColor: bibtex ? 'success.50' : undefined
    }}
    >
    {bibtex ? `📋 ${bibtex.name}` : "BibTeX File (optional)"}
    <input
    type="file"
    name="bibtex"
    accept=".bib"
    hidden
    disabled={isDisabled}
    onChange={handleBibtexChange}
    />
    </Button>
    </Stack>
    </Paper>

    {/* Form Fields - IMPROVED AND COMPACT LAYOUT */}
    <Stack spacing={1.5}> {/* 🔧 FIX: Reduced spacing */}
    <Typography
    variant="subtitle2"
    fontWeight="bold"
    color={isDisabled ? "text.disabled" : "primary"}
    fontSize="0.9rem" // 🔧 FIX: Reduced font size
    >
    📝 Publication information {fieldsRequired ? "(required)" : "(optional)"}
    </Typography>

    <TextField
    name="title"
    label={`Title${fieldsRequired ? ' *' : ''}`}
    value={form.title}
    onChange={handleChange}
    required={fieldsRequired}
    fullWidth
    disabled={isDisabled}
    multiline
    rows={1} // 🔧 FIX: Reduced from 2 to 1 row
    size="small" // 🔧 FIX: Added small size
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: '0.85rem' // 🔧 FIX: Reduced font size
      }
    }}
    />

    <TextField
    name="authors"
    label={`Authors (separated by commas)${fieldsRequired ? ' *' : ''}`}
    value={form.authors}
    onChange={handleChange}
    required={fieldsRequired}
    fullWidth
    disabled={isDisabled}
    placeholder="John Smith, Jane Doe, Mark Johnson"
    size="small" // 🔧 FIX: Added small size
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: '0.85rem' // 🔧 FIX: Reduced font size
      }
    }}
    />

    {/* IMPROVED LAYOUT WITH GRID INSTEAD OF FLEX BOX */}
    <Grid container spacing={1.5}> {/* 🔧 FIX: Reduced spacing */}
    <Grid item xs={12} sm={4}>
    <TextField
    name="year"
    label={`Year${fieldsRequired ? ' *' : ''}`}
    type="number"
    value={form.year}
    onChange={handleChange}
    required={fieldsRequired}
    disabled={isDisabled}
    fullWidth
    size="small" // 🔧 FIX: Added small size
    inputProps={{
      min: 1900,
      max: new Date().getFullYear() + 5
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: '0.85rem' // 🔧 FIX: Reduced font size
      }
    }}
    />
    </Grid>
    <Grid item xs={12} sm={8}>
    <TextField
    name="journal"
    label={`Journal/Conference${fieldsRequired ? ' *' : ''}`}
    value={form.journal}
    onChange={handleChange}
    required={fieldsRequired}
    disabled={isDisabled}
    fullWidth
    placeholder="Nature, IEEE Transactions, ICML 2024, etc."
    size="small" // 🔧 FIX: Added small size
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: '0.85rem' // 🔧 FIX: Reduced font size
      }
    }}
    />
    </Grid>
    </Grid>

    {/* NEW DOI FIELD - COMPACT */}
    <TextField
    name="doi"
    label="DOI (optional)"
    value={form.doi}
    onChange={handleChange}
    fullWidth
    disabled={isDisabled}
    placeholder="e.g. 10.1000/182"
    helperText="Format: 10.xxxx/xxxxx (leave blank if not available)"
    size="small" // 🔧 FIX: Added small size
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        fontSize: '0.85rem' // 🔧 FIX: Reduced font size
      },
      '& .MuiFormHelperText-root': {
        fontSize: '0.7rem' // 🔧 FIX: Reduced helper text font size
      }
    }}
    inputProps={{
      pattern: "^10\\.\\d{4,}/[-._;()/:\\w\\[\\]]+$"
    }}
    />
    </Stack>

    {/* Result Section */}
    {result && (
      <Alert
      severity={result.error ? "error" : "success"}
      icon={result.error ? undefined : <CheckCircleIcon fontSize="small" />}
      sx={{
        borderRadius: 2,
        py: 1, // 🔧 FIX: Reduced padding
        '& .MuiAlert-message': {
          fontSize: '0.8rem' // 🔧 FIX: Reduced font size
        }
      }}
      >
      {result.error ? (
        result.error
      ) : (
        <Box>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom fontSize="0.85rem">
        🎉 Publication uploaded successfully!
        </Typography>
        <Typography variant="body2" fontSize="0.75rem">
        "{result.title}" has been added to the database. The window will close automatically and the page will be refreshed.
        </Typography>
        </Box>
      )}
      </Alert>
    )}
    </Stack>
    </DialogContent>

    <Divider sx={{ flexShrink: 0 }} />

    {/* 🔧 FIX: Compact DialogActions */}
    <DialogActions sx={{ p: 2, gap: 1.5, flexShrink: 0 }}> {/* 🔧 FIX: Reduced padding and gap */}
    <Button
    onClick={handleClose}
    variant="outlined"
    size="medium" // 🔧 FIX: Changed from large to medium
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      minWidth: 80, // 🔧 FIX: Reduced minWidth
      fontSize: '0.85rem' // 🔧 FIX: Reduced font size
    }}
    >
    {isDisabled ? "Close" : "Cancel"}
    </Button>

    {isDisabled ? (
      <Button
      variant="contained"
      startIcon={<LoginIcon fontSize="small" />}
      size="medium" // 🔧 FIX: Changed from large to medium
      onClick={handleClose}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        minWidth: 120, // 🔧 FIX: Reduced minWidth
        fontSize: '0.85rem', // 🔧 FIX: Reduced font size
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                   '&:hover': {
                     background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                   }
      }}
      >
      Go to Login
      </Button>
    ) : (
      <Button
      type="submit"
      variant="contained"
      disabled={loading || !file || !isFormValid || result?.id}
      size="medium" // 🔧 FIX: Changed from large to medium
      startIcon={<PublishIcon fontSize="small" />}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        minWidth: 120, // 🔧 FIX: Reduced minWidth
        fontSize: '0.85rem', // 🔧 FIX: Reduced font size
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
         '&:hover': {
           background: 'linear-gradient(135deg, #5a67d8 0%, #6b4c93 100%)',
         transform: 'translateY(-1px)',
         boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
         },
         transition: 'all 0.3s ease'
      }}
      >
      {loading ? "Uploading..." : "Upload publication"}
      </Button>
    )}
    </DialogActions>
    </form>
    </Dialog>
  );
}