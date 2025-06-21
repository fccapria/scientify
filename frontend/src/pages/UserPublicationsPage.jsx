import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserPublications, deletePublication } from "../api/publications";
import {
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Chip,
  Grid,
  Stack,
  Button,
  Divider,
  ButtonGroup,
  IconButton,
  Tooltip
} from "@mui/material";
import { useState } from "react";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SortIcon from '@mui/icons-material/Sort';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import DeletePublicationDialog from "../components/DeletePublicationDialog";

import config from '../config';

export default function UserPublicationsPage() {
  const { token } = useAuth();
  const [orderBy, setOrderBy] = useState("date_desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["userPublications", { token, orderBy }],
    queryFn: fetchUserPublications,
  });

  // Mutation to delete a publication
  const deleteMutation = useMutation({
    mutationFn: ({ publicationId }) => deletePublication({ publicationId, token }),
                                      onSuccess: (data, variables) => {
                                        // Invalidate and reload publications list
                                        queryClient.invalidateQueries({ queryKey: ["userPublications"] });
                                        setDeleteDialogOpen(false);
                                        setPublicationToDelete(null);
                                      },
                                      onError: (error) => {
                                        console.error("Error deleting:", error);
                                      }
  });

  // Function to open the confirmation dialog
  const handleDeleteClick = (publication) => {
    setPublicationToDelete(publication);
    setDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const handleConfirmDelete = (publicationId) => {
    deleteMutation.mutate({ publicationId });
  };

  // Function to get current sort information
  const getOrderInfo = () => {
    switch(orderBy) {
      case "date_asc": return { type: "date", direction: "asc", label: "Date ascending", icon: <ArrowUpwardIcon /> };
      case "date_desc": return { type: "date", direction: "desc", label: "Date descending", icon: <ArrowDownwardIcon /> };
      case "title_asc": return { type: "title", direction: "asc", label: "Title A-Z", icon: <ArrowUpwardIcon /> };
      case "title_desc": return { type: "title", direction: "desc", label: "Title Z-A", icon: <ArrowDownwardIcon /> };
      default: return { type: "date", direction: "desc", label: "Date descending", icon: <ArrowDownwardIcon /> };
    }
  };

  // Function to handle sort button clicks
  const handleSort = (type) => {
    const currentOrder = getOrderInfo();

    if (currentOrder.type === type) {
      // If same type, toggle direction
      const newDirection = currentOrder.direction === "asc" ? "desc" : "asc";
      setOrderBy(`${type}_${newDirection}`);
    } else {
      // If different type, set default direction
      const defaultDirection = type === "date" ? "desc" : "asc";
      setOrderBy(`${type}_${defaultDirection}`);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
      <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress size={60} />
      </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
      <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
      {error.message}
      </Alert>
      </Container>
    );
  }

  const currentOrder = getOrderInfo();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
    <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
    📚 My Publications
    </Typography>

    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
    <Typography variant="h6" color="text.secondary">
    {data?.length || 0} publications uploaded
    </Typography>
    {data?.length > 0 && (
      <Chip
      label={`Latest: ${new Date(data[0]?.upload_date).toLocaleDateString()}`}
      color="primary"
      variant="outlined"
      size="small"
      />
    )}
    </Box>

    {/* Sort controls */}
    {data?.length > 1 && (
      <Box display="flex" alignItems="center" gap={2}>
      <Box display="flex" alignItems="center" gap={1}>
      <SortIcon fontSize="small" color="action" />
      <Typography variant="body2" color="text.secondary">
      Sort:
      </Typography>
      </Box>

      <ButtonGroup variant="outlined" size="small">
      {/* Date button */}
      <Button
      variant={currentOrder.type === "date" ? "contained" : "outlined"}
      onClick={() => handleSort("date")}
      startIcon={currentOrder.type === "date" ? currentOrder.icon : <CalendarTodayIcon />}
      sx={{
        borderRadius: '8px 0 0 8px',
        textTransform: 'none',
        fontWeight: currentOrder.type === "date" ? 'bold' : 'normal',
        minWidth: '100px'
      }}
      >
      {currentOrder.type === "date" ? currentOrder.label : "Date"}
      </Button>

      {/* Title button */}
      <Button
      variant={currentOrder.type === "title" ? "contained" : "outlined"}
      onClick={() => handleSort("title")}
      startIcon={currentOrder.type === "title" ? currentOrder.icon : <SortByAlphaIcon />}
      sx={{
        borderRadius: '0 8px 8px 0',
        textTransform: 'none',
        fontWeight: currentOrder.type === "title" ? 'bold' : 'normal',
        minWidth: '100px'
      }}
      >
      {currentOrder.type === "title" ? currentOrder.label : "Title"}
      </Button>
      </ButtonGroup>
      </Box>
    )}
    </Box>

    {/* Active sort indicator */}
    {data?.length > 1 && (
      <Box sx={{ mt: 2 }}>
      <Chip
      label={`Sort by: ${currentOrder.label}`}
      size="small"
      color="primary"
      variant="outlined"
      icon={currentOrder.icon}
      sx={{
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          fontSize: '1rem'
        }
      }}
      />
      </Box>
    )}
    </Box>

    {/* Delete error alert */}
    {deleteMutation.error && (
      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
      {deleteMutation.error.message}
      </Alert>
    )}

    {/* Delete success alert */}
    {deleteMutation.isSuccess && (
      <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
      Publication successfully deleted!
      </Alert>
    )}

    {/* Publications */}
    {data?.length > 0 ? (
      <Grid container spacing={3}>
      {data.map(pub => (
        <Grid item xs={12} key={pub.id}>
        <Card
        elevation={2}
        sx={{
          borderRadius: 3,
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: 'primary.100',
          '&:hover': {
            transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                        borderColor: 'primary.300'
          }
        }}
        >
        <CardContent sx={{ p: 3 }}>
        {/* Header with title and delete button */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          lineHeight: 1.3,
          flex: 1,
          mr: 2
        }}
        >
        {pub.title}
        </Typography>

        <Tooltip title="Delete publication">
        <IconButton
        onClick={() => handleDeleteClick(pub)}
        color="error"
        size="small"
        sx={{
          '&:hover': {
            backgroundColor: 'error.50',
          }
        }}
        >
        <DeleteIcon fontSize="small" />
        </IconButton>
        </Tooltip>
        </Box>

        {/* Main information */}
        <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {/* Date */}
        <Box display="flex" alignItems="center" gap={1}>
        <CalendarTodayIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
        Uploaded on {new Date(pub.upload_date).toLocaleDateString()}
        {pub.year && ` (Year: ${pub.year})`}
        </Typography>
        </Box>

        {/* File info */}
        {pub.filename && (
          <Box display="flex" alignItems="center" gap={1}>
          <PictureAsPdfIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
          {pub.filename}
          </Typography>
          </Box>
        )}
        </Stack>

        {/* Journal/Conference */}
        {pub.journal && (
          <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <MenuBookIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Published in:
          </Typography>
          </Box>
          <Chip
          label={pub.journal}
          variant="outlined"
          sx={{
            ml: 3,
            backgroundColor: 'info.50',
            borderColor: 'info.200',
            color: 'info.700',
            fontWeight: 'medium',
            '&:hover': {
              backgroundColor: 'info.100',
            }
          }}
          />
          </Box>
        )}

        {/* Keywords */}
        {pub.keywords && pub.keywords.length > 0 && (
          <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <LocalOfferIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Keywords:
          </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ ml: 3 }}>
          {pub.keywords.map((keyword, index) => (
            <Chip
            key={index}
            label={keyword.name}
            size="small"
            sx={{
              backgroundColor: 'secondary.50',
              color: 'secondary.700',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: 'secondary.100',
              }
            }}
            />
          ))}
          </Box>
          </Box>
        )}

        {/* DOI */}
        {pub.doi && (
          <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <LinkIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
          DOI:
          </Typography>
          </Box>
          <Chip
          label={pub.doi}
          variant="outlined"
          component="a"
          href={`https://doi.org/${pub.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          clickable
          sx={{
            ml: 3,
            backgroundColor: 'success.50',
            borderColor: 'success.200',
            color: 'success.700',
            fontWeight: 'medium',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: 'success.100',
              textDecoration: 'none',
            }
          }}
          />
          </Box>
        )}

        {/* Authors */}
        {pub.authors && pub.authors.length > 0 && (
          <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Authors:
          </Typography>
          </Box>
          <Typography variant="body2" color="text.primary" sx={{ ml: 3 }}>
          {pub.authors.map(a => a.name).join(", ")}
          </Typography>
          </Box>
        )}

        {/* Alert if no keywords */}
        {(!pub.keywords || pub.keywords.length === 0) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
          ⚠️ This publication has no keywords! The search system relies on keywords.
          </Typography>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.disabled">
        Publication ID: #{pub.id}
        </Typography>
        <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        href={`${config.API_URL}/download/${pub.id}`}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'bold'
        }}
        >
        View PDF
        </Button>
        </Box>
        </CardContent>
        </Card>
        </Grid>
      ))}
      </Grid>
    ) : (
      /* Empty state */
      <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        py: 8,
        textAlign: 'center'
      }}
      >
      <CloudUploadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
      You haven't uploaded any publications yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Use the UPLOAD button in the header to add your first publication
      </Typography>
      <Button
      variant="contained"
      startIcon={<CloudUploadIcon />}
      onClick={() => window.location.href = '/'}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 'bold'
      }}
      >
      Go to homepage
      </Button>
      </Box>
    )}

    {/* Delete confirmation dialog */}
    <DeletePublicationDialog
    open={deleteDialogOpen}
    onClose={() => {
      setDeleteDialogOpen(false);
      setPublicationToDelete(null);
    }}
    publication={publicationToDelete}
    onConfirmDelete={handleConfirmDelete}
    loading={deleteMutation.isPending}
    />
    </Container>
  );
}