/* eslint-disable react/prop-types */
import { Box, Typography, Button, Paper } from '@mui/material';

const EmptyState = ({ title = 'Nothing here yet', description, actionLabel, onAction, icon: Icon }) => {
  return (
    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
      {Icon && <Icon sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} aria-hidden />}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} aria-label={actionLabel}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;




