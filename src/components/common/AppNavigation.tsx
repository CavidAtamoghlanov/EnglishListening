import { Pressable, StyleSheet, View } from "react-native";
import { BarChart3, BookOpen, Home, MessageSquareText, UserRound } from "lucide-react-native";
import type { Href } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import { AppText } from "./AppText";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";

type AppNavigationProps = {
  variant?: "bottom" | "sidebar";
};

const items = [
  { label: "Home", route: "/home", icon: Home },
  { label: "Sözlər", route: "/words/levels", icon: BookOpen },
  { label: "Cümlələr", route: "/sentences", icon: MessageSquareText },
  { label: "Statistika", route: "/statistics", icon: BarChart3 },
  { label: "Profil", route: "/settings", icon: UserRound },
] as const;

function isActive(pathname: string, route: string) {
  if (route === "/home") {
    return pathname === "/home";
  }
  if (route === "/settings") {
    return pathname.startsWith("/settings") || pathname.startsWith("/profile");
  }
  const root = route.split("/")[1];
  return root ? pathname.startsWith(`/${root}`) : pathname === route;
}

export function AppNavigation({ variant = "bottom" }: AppNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const vertical = variant === "sidebar";

  return (
    <View style={[styles.nav, vertical && styles.navVertical]}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.route);
        return (
          <Pressable
            key={item.route}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => router.push(item.route as Href)}
            style={({ pressed }) => [
              styles.item,
              vertical && styles.itemVertical,
              active && styles.itemActive,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              color={active ? colors.primary : colors.muted}
              size={vertical ? 19 : 20}
              strokeWidth={2.45}
            />
            <AppText
              variant="small"
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    width: "100%",
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: colors.nav,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navVertical: {
    width: 112,
    minHeight: 520,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: spacing.md,
    borderRadius: radii.xxl,
  },
  item: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: radii.lg,
  },
  itemVertical: {
    flex: 0,
    width: "100%",
    minHeight: 62,
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  itemActive: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  labelActive: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
