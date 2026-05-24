import { Platform } from "react-native";

export const lessonColors = {
  background: "#07111F",
  backgroundAlt: "#081420",
  card: "#0E1A2B",
  panel: "#0C1726",
  panelRaised: "#101E31",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  text: "#FFFFFF",
  muted: "#94A3B8",
  yellow: "#FACC15",
  yellowButton: "#FFD21F",
  green: "#7CE02F",
  success: "#67D53B",
  red: "#EF4444",
  blue: "#38BDF8",
  overlay: "rgba(3,8,16,0.72)",
};

export const lessonShadow = Platform.select({
  web: {
    boxShadow: "0 24px 80px rgba(0,0,0,0.42)",
  },
  default: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.36,
    shadowRadius: 26,
    elevation: 9,
  },
});

export const lessonGlow = {
  neutral: Platform.select({
    web: { boxShadow: "0 0 34px rgba(250,204,21,0.30), 0 24px 80px rgba(0,0,0,0.42)" },
    default: {
      shadowColor: lessonColors.yellow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.34,
      shadowRadius: 20,
      elevation: 10,
    },
  }),
  correct: Platform.select({
    web: { boxShadow: "0 0 36px rgba(103,213,59,0.36), 0 24px 80px rgba(0,0,0,0.42)" },
    default: {
      shadowColor: lessonColors.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.36,
      shadowRadius: 20,
      elevation: 10,
    },
  }),
  wrong: Platform.select({
    web: { boxShadow: "0 0 36px rgba(239,68,68,0.34), 0 24px 80px rgba(0,0,0,0.42)" },
    default: {
      shadowColor: lessonColors.red,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.36,
      shadowRadius: 20,
      elevation: 10,
    },
  }),
};
