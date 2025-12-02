'use client';

import Box from '@mui/material/Box';

export default function SimpleLayout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {children}
    </Box>
  );
}
