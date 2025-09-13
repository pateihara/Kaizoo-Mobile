import { colors } from "@/theme";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    name: React.ComponentProps<typeof Ionicons>["name"];
    size?: number;
    color?: string;
};

export default function Icon({ name, size = 20, color = colors.gray[900] }: Props) {
    return <Ionicons name={name} size={size} color={color} />;
}
