import { Platform } from "react-native";

export const shadows = {
  none: {},
  card: Platform.select({
    web: {
      boxShadow: "0 24px 70px rgba(0, 0, 0, 0.34)",
    },
    default: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
      elevation: 6,
    },
  }),
  soft: Platform.select({
    web: {
      boxShadow: "0 14px 36px rgba(0, 0, 0, 0.26)",
    },
    default: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 16,
      elevation: 4,
    },
  }),
  button: Platform.select({
    web: {
      boxShadow: "0 12px 26px rgba(255, 210, 31, 0.28)",
    },
    default: {
      shadowColor: "#FFD21F",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.26,
      shadowRadius: 10,
      elevation: 3,
    },
  }),
  glow: Platform.select({
    web: {
      boxShadow: "0 0 30px rgba(255, 210, 31, 0.20), 0 24px 70px rgba(0,0,0,0.34)",
    },
    default: {
      shadowColor: "#FFD21F",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 7,
    },
  }),
};
