/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography } from "@mui/material";

const PageContainer = ({ title, subtitle, action, children }) => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3.5 } }}>
      {(title || subtitle) && (
        <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              {title && <Typography variant="h2" sx={{ fontWeight: 850 }}>{title}</Typography>}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 820 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && <Box sx={{ flexShrink: 0, pt: 0.5 }}>{action}</Box>}
          </Stack>
        </Box>
      )}
      {children}
    </Container>
  );
};

export default PageContainer;
