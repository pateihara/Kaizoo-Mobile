// @/components/atoms/Card.tsx
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    variant?: "default" | "highlight";
};

export default function Card({ children, style, variant = "default" }: Props) {
    return (
        <View
            style={[
                styles.card,
                variant === "default" && styles.default,
                variant === "highlight" && styles.highlight,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        overflow: "hidden",
    },
    default: {
        borderWidth: 1,
        borderColor: "#eee",
    },
    highlight: {
        borderWidth: 2,
        borderColor: "#0077FF",
        backgroundColor: "#E6F4FE",
    },
});
