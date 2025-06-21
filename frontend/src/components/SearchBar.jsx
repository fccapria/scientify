import { TextField, Box, Container, Paper } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from "@mui/material";

import config from '../config';

export default function SearchBar({ value, onChange }) {
  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper 
          elevation={3}
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            maxWidth: 600,
            width: '100%'
          }}
        >
          <TextField
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Search by keywords, authors or title..."
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                padding: '8px 16px'
              }
            }}
            inputProps={{ "aria-label": "search" }}
          />
        </Paper>
      </Box>
    </Container>
  );
}