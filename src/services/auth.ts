import AsyncStorage from "@react-native-async-storage/async-storage";

export async function isLoggedIn() {
    const token = await AsyncStorage.getItem("authToken");
    return !!token;
}

export async function hasSeenOnboarding() {
    return (await AsyncStorage.getItem("hasOnboarded")) === "true";
}

export async function setOnboardingSeen() {
    await AsyncStorage.setItem("hasOnboarded", "true");
}
