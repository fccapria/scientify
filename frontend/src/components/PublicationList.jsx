import { useQuery } from "@tanstack/react-query";
import { fetchPublications } from "../api/publications";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Container,
  Grid,
  Button,
  Divider,
  Stack,
  ButtonGroup
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SortIcon from '@mui/icons-material/Sort';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import LinkIcon from '@mui/icons-material/Link';

import config from '../config';

export default function PublicationList({ search }) {
  const [orderBy, setOrderBy] = useState("date_desc");
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["publications", { search, orderBy, token }],
    queryFn: fetchPublications,
  });

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
    <Container maxWidth="lg">
    {/* Header with advanced sort controls */}
    <Box sx={{ mb: 3 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
    <Typography variant="h6" color="text.secondary">
    {data?.length || 0} publications found
    {search && (
      <Typography component="span" variant="body2" color="primary.main" sx={{ ml: 1, fontWeight: 'bold' }}>
      for "{search}"
      </Typography>
    )}
    </Typography>

    {/* Sort controls */}
    {data?.length > 1 && (
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      <Box display="flex" alignItems="center" gap={1}>
      <SortIcon fontSize="small" color="action" />
      <Typography variant="body2" color="text.secondary">
      Sort by:
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
    <Box sx={{ mt: 1 }}>
    <Chip
    label={`Active sort: ${currentOrder.label}`}
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

    {/* Info about keyword system */}
    {search && (
      <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
      <Typography variant="body2">
      🎯 <strong>Keyword-Based Search:</strong> Search prioritizes keywords, then authors, then titles.
      Try combining keywords for more precise results!
      </Typography>
      </Alert>
    )}
    </Box>

    {/* Publications grid */}
    <Grid container spacing={3}>
    {data?.map(pub => (
      <Grid item xs={12} key={pub.id}>
      <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
                       boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
        }
      }}
      >
      <CardContent sx={{ p: 3 }}>
      {/* Title */}
      <Typography
      variant="h6"
      component="h2"
      sx={{
        mb: 2,
        fontWeight: 'bold',
        color: 'primary.main',
        lineHeight: 1.3
      }}
      >
      {pub.title}
      </Typography>

      {/* Main information */}
      <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
      {/* Date */}
      <Box display="flex" alignItems="center" gap={1}>
      <CalendarTodayIcon fontSize="small" color="action" />
      <Typography variant="body2" color="text.secondary">
      {new Date(pub.upload_date).toLocaleDateString()}
      {pub.year && ` (${pub.year})`}
      </Typography>
      </Box>

      {/* Authors */}
      {pub.authors && pub.authors.length > 0 && (
        <Box display="flex" alignItems="center" gap={1}>
        <PersonIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
        {Array.isArray(pub.authors)
          ? pub.authors.map(a => a.name ?? a).join(", ")
          : pub.authors}
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
        {(Array.isArray(pub.keywords) ? pub.keywords : []).map((keyword, index) => (
          <Chip
          key={index}
          label={keyword.name ?? keyword}
          size="small"
          sx={{
            backgroundColor: 'primary.50',
            color: 'primary.700',
            fontWeight: 'medium',
            '&:hover': {
              backgroundColor: 'primary.100',
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

      {/* Alert if no keywords */}
      {(!pub.keywords || pub.keywords.length === 0) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
        ⚠️ This publication has no keywords! The system relies on keywords for search.
        </Typography>
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end">
      <Button
      variant="contained"
      startIcon={<PictureAsPdfIcon />}
      href={`${config.API_URL}/download/${pub.id}`}
      target="_blank"
      rel="noopener noreferrer"
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

    {/* Message for no results */}
    {data?.length === 0 && (
      <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ py: 8 }}
      >
      <Typography variant="h6" color="text.secondary" gutterBottom>
      No publications found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Try modifying your search terms
      </Typography>
      {search && (
        <Alert severity="info" sx={{ mt: 2, maxWidth: 500 }}>
        <Typography variant="body2">
        💡 <strong>Tip:</strong> The system primarily searches in keywords.
        Try more generic terms or different combinations!
        </Typography>
        </Alert>
      )}
      </Box>
    )}
    </Container>
  );
}