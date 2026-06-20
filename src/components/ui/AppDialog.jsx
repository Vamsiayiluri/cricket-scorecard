/* eslint-disable react/prop-types */
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import AppButton from "./AppButton";

const renderActions = (actions) => {
  if (!actions) return null;
  if (Array.isArray(actions) && actions.length > 0 && typeof actions[0] === "object" && !actions[0].$$typeof) {
    return actions.map((a, i) => (
      <AppButton
        key={i}
        variant={a.variant || "outlined"}
        color={a.color}
        onClick={a.onClick}
        disabled={a.disabled}
        loading={a.loading}
        size="small"
        sx={{ minHeight: 34 }}
      >
        {a.label}
      </AppButton>
    ));
  }
  return actions;
};

const AppDialog = ({ title, actions, children, ...props }) => {
  return (
    <Dialog fullWidth maxWidth="sm" {...props}>
      {title && <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>{title}</DialogTitle>}
      <DialogContent sx={{ pt: title ? 1 : 2 }}>{children}</DialogContent>
      {actions && <DialogActions sx={{ px: 3, pb: 2.5 }}>{renderActions(actions)}</DialogActions>}
    </Dialog>
  );
};

export default AppDialog;
