/* eslint-disable react/prop-types */
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const AppDialog = ({ title, actions, children, ...props }) => {
  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      {title && <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>{title}</DialogTitle>}
      <DialogContent sx={{ pt: title ? 1 : 2 }}>{children}</DialogContent>
      {actions && <DialogActions sx={{ px: 3, pb: 2.5 }}>{actions}</DialogActions>}
    </Dialog>
  );
};

export default AppDialog;
