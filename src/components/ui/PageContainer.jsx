/* eslint-disable react/prop-types */
import { Box, Container, Typography } from "@mui/material";

const PageContainer = ({ title, subtitle, children }) => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3.5 } }}>
      {(title || subtitle) && (
        <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
          {title && <Typography variant="h2" sx={{ fontWeight: 850 }}>{title}</Typography>}
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 820 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Container>
  );
};

export default PageContainer;
