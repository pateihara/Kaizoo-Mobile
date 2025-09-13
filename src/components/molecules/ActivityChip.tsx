import { bitmapIcons } from "@/assets";
import Text from "@/components/atoms/Text";
import { Image, View } from "react-native";

export default function ActivityChip({ icon, label }: { icon: string; label: string }) {
    return (
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <Image source={bitmapIcons.bike} style={{ width: 16, height: 16 }} />
            <Text variant="body">45min.</Text>
        </View>
    );
}
