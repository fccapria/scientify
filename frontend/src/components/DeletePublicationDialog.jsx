import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
    Box,
    IconButton
} from "@mui/material";
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

export default function DeletePublicationDialog({
    open,
    onClose,
    publication,
    onConfirmDelete,
    loading = false
}) {
    if (!publication) return null;

    return (
        <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
            sx: {
                borderRadius: 3,
            }
        }}
        >
        <DialogTitle sx={{
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'error.50'
        }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
        <WarningIcon color="error" />
        <Typography variant="h6" fontWeight="bold" color="error.main">
        Confirm Deletion
        </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
        <CloseIcon />
        </IconButton>
        </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
        <Typography variant="body2" fontWeight="medium">
        Warning: this action cannot be undone!
        </Typography>
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
        Are you sure you want to permanently delete this publication?
        </Typography>

        <Box
        sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
        }}
        >
        <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
        {publication.title}
        </Typography>

        {publication.authors && publication.authors.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Authors: {publication.authors.map(a => a.name).join(", ")}
            </Typography>
        )}

        {publication.journal && (
            <Typography variant="body2" color="text.secondary">
            Published in: {publication.journal}
            </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
        Uploaded on: {new Date(publication.upload_date).toLocaleDateString()}
        </Typography>
        </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
        onClick={onClose}
        variant="outlined"
        disabled={loading}
        sx={{
            borderRadius: 2,
            textTransform: 'none',
            minWidth: 100
        }}
        >
        Cancel
        </Button>

        <Button
        onClick={() => onConfirmDelete(publication.id)}
        variant="contained"
        color="error"
        disabled={loading}
        startIcon={<DeleteIcon />}
        sx={{
            borderRadius: 2,
            textTransform: 'none',
            minWidth: 120
        }}
        >
        {loading ? "Deleting..." : "Delete Permanently"}
        </Button>
        </DialogActions>
        </Dialog>
    );
}