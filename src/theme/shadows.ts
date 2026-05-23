import { Platform } from "react-native";

export const shadows = {
  none: {},
  card: Platform.select({
    web: {
      boxShadow: "0 18px 42px rgba(31, 43, 74, 0.10)",
    },
    default: {
      shadowColor: "#1F2B4A",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 4,
    },
  }),
  soft: Platform.select({
    web: {
      boxShadow: "0 10px 26px rgba(31, 43, 74, 0.08)",
    },
    default: {
      shadowColor: "#1F2B4A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 2,
    },
  }),
  button: Platform.select({
    web: {
      boxShadow: "0 10px 22px rgba(58, 124, 255, 0.22)",
    },
    default: {
      shadowColor: "#3A7CFF",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 3,
    },
  }),
};
