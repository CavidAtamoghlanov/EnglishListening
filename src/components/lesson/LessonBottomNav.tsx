import { Pressable, StyleSheet, View } from "react-native";
import { BarChart3, BookOpen, Eye, Volume2 } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { lessonColors } from "./lessonTheme";

type LessonBottomNavProps = {
  primaryLabel: string;
  vertical?: boolean;
};

export function LessonBottomNav({ primaryLabel, vertical = false }: LessonBottomNavProps) {
  const items = [
    { label: primaryLabel, icon: BookOpen, active: true },
    { label: "Bax", icon: Eye, active: false },
    { label: "Statistika", icon: BarChart3, active: false },
    { label: "Səs", icon: Volume2, active: false },
  ];

  return (
    <View style={[styles.wrap, vertical && styles.wrapVertical]}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            style={({ pressed }) => [
              styles.item,
              vertical && styles.itemVertical,
              item.active && styles.itemActive,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              size={20}
              color={item.active ? lessonColors.yellowButton : lessonColors.muted}
              strokeWidth={2.5}
            />
            <AppText
              variant="small"
              style={[styles.label, item.active && styles.labelActive]}
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
  wrap: {
    width: "100%",
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "rgba(12,23,38,0.96)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  wrapVertical: {
    width: 76,
    minHeight: 440,
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 18,
    borderRadius: 28,
  },
  item: {
    minWidth: 58,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 16,
  },
  itemVertical: {
    width: "100%",
    minWidth: 0,
  },
  itemActive: {
    backgroundColor: "rgba(250,204,21,0.10)",
  },
  label: {
    maxWidth: 78,
    color: lessonColors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  labelActive: {
    color: lessonColors.yellowButton,
  },
  pressed: {
    opacity: 0.78,
  },
});
