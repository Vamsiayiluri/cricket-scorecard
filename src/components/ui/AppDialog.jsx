import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const AppDialog = ({ title, actions, children, ...props }) => {
  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

export default AppDialog;
