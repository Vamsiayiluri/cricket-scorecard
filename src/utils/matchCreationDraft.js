import { EMPTY_MATCH_FORM } from "../constants/matchCreation";

const DRAFT_KEY = "cricket-scorecard.match-creation-draft";
const DRAFT_VERSION = 1;

export const loadMatchCreationDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed.version !== DRAFT_VERSION) {
      return null;
    }
    return {
      formData: { ...EMPTY_MATCH_FORM, ...parsed.formData },
      activeStep: parsed.activeStep ?? 0,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
};

export const saveMatchCreationDraft = (formData, activeStep) => {
  try {
    const payload = {
      version: DRAFT_VERSION,
      formData,
      activeStep,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};

export const clearMatchCreationDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
};

export const hasMeaningfulDraft = (formData) => {
  const md = formData?.matchDetails || {};
  const hasTeams =
    (formData?.teams?.teamA?.players?.length || 0) > 0 ||
    (formData?.teams?.teamB?.players?.length || 0) > 0;

  return Boolean(
    trim(md.teamA) ||
      trim(md.teamB) ||
      trim(md.venue) ||
      trim(md.dateTime) ||
      trim(formData?.notes) ||
      hasTeams
  );
};

const trim = (v) => (typeof v === "string" ? v.trim() : v);
