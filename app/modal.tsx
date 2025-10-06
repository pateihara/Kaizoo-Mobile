// app/modal.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal simples</Text>
      <Text style={styles.desc}>
        Esse modal usa só React Native (sem ThemedText/ThemedView).
      </Text>
      <Button title="Fechar" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600" },
  desc: { fontSize: 16, opacity: 0.7 },
});
