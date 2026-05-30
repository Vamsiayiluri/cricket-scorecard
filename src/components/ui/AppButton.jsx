/* eslint-disable react/prop-types */
import { Button, CircularProgress } from "@mui/material";

const AppButton = ({ children, disabled, loading = false, sx, variant = "contained", ...props }) => {
  const isOutlined = variant === "outlined" || variant === "text";
  const isText = variant === "text";
  
  return (
    <Button
      variant={variant}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      sx={{
        minHeight: { xs: 42, sm: 40 },
        px: 2,
        borderRadius: 1, // Inherits 8px from theme
        fontWeight: 700,
        textTransform: "none",
        fontSize: "0.85rem",
        letterSpacing: "0.01em",
        transition: "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
        background: isOutlined
          ? "transparent"
          : "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
        borderColor: isOutlined && !isText ? "rgba(108, 99, 255, 0.3)" : undefined,
        color: isOutlined ? "text.primary" : "#F8FAFC",
        boxShadow: isOutlined ? "none" : "0 2px 6px rgba(108, 99, 255, 0.15)",
        "&:hover": {
          background: isOutlined
            ? isText
              ? "rgba(108, 99, 255, 0.06)"
              : "rgba(108, 99, 255, 0.04)"
            : "linear-gradient(135deg, #5b53e6 0%, #7c3aed 100%)",
          borderColor: isOutlined && !isText ? "#6C63FF" : undefined,
          boxShadow: isOutlined ? "none" : "0 4px 10px rgba(108, 99, 255, 0.22)",
        },
        "&.Mui-disabled": {
          background: isOutlined ? "transparent" : "rgba(255, 255, 255, 0.08)",
          color: "text.disabled",
          borderColor: isOutlined ? "rgba(255, 255, 255, 0.04)" : undefined,
          boxShadow: "none",
        },
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          thickness={5}
          color="inherit"
          sx={{ mr: 1 }}
        />
      )}
      {children}
    </Button>
  );
};

export default AppButton;
