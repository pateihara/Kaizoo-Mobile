//src/components/molecules/ProgressBar.tsx
import { colors } from "@/theme";
import { View } from "react-native";

type Props = { progress: number }; // 0..1

export default function ProgressBar({ progress }: Props) {
    return (
        <View style={{ height: 10, backgroundColor: colors.gray[200], borderRadius: 999, overflow: "hidden" }}>
            <View style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%`, backgroundColor: colors.brand.primary, height: "100%" }} />
        </View>
    );
}
