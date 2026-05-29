export const findFirestoreInvalidValues = (value, path = "payload") => {
  const issues = [];

  const visit = (current, currentPath, parentIsArray = false) => {
    if (current === undefined) {
      issues.push(`${currentPath}: undefined value`);
      return;
    }

    if (Array.isArray(current)) {
      if (parentIsArray) {
        issues.push(`${currentPath}: nested array`);
      }
      current.forEach((item, index) => visit(item, `${currentPath}[${index}]`, true));
      return;
    }

    if (!current || typeof current !== "object" || current instanceof Date) {
      return;
    }

    if (typeof current.toDate === "function" || typeof current.toMillis === "function") {
      return;
    }

    Object.entries(current).forEach(([key, nested]) => {
      visit(nested, `${currentPath}.${key}`, false);
    });
  };

  visit(value, path);
  return issues;
};

export const assertFirestoreSafePayload = (payload) => {
  const issues = findFirestoreInvalidValues(payload);
  if (issues.length) {
    throw new Error(`Firestore payload contains invalid values: ${issues.join("; ")}`);
  }
};
