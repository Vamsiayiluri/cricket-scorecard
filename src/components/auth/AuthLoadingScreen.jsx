import React from "react";
import { PageLoading } from "../ui/LoadingState";

const AuthLoadingScreen = ({ text = "Restoring session..." }) => (
  <PageLoading text={text} />
);

export default AuthLoadingScreen;
