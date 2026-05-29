import { SCORER_ROLES, USER_ROLES } from "../services/firebase/constants";

export { USER_ROLES, SCORER_ROLES };

export const isScorerRole = (role) => SCORER_ROLES.includes(role);

export const isViewerRole = (role) => role === USER_ROLES.VIEWER;

export const getRoleLabel = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "Admin";
    case USER_ROLES.SCORER:
      return "Scorer";
    case USER_ROLES.VIEWER:
      return "Viewer";
    default:
      return "User";
  }
};
