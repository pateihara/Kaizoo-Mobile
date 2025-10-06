// //src/components/organisms/MascotScene.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Easing, ImageBackground, StyleSheet } from "react-native";

// ... seus imports e mapeamentos (BG_BY_MASCOT, CHAR_BY_MASCOT) ...

export function MascotScene({ bgSource, charSource }: { bgSource: any; charSource: any }) {
    // animações
    const bgX = useRef(new Animated.Value(0)).current;
    const bob = useRef(new Animated.Value(0)).current;
    const breathe = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // BG: parallax horizontal (vai e volta)
        Animated.loop(
            Animated.sequence([
                Animated.timing(bgX, {
                    toValue: 1,
                    duration: 6000,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(bgX, {
                    toValue: 0,
                    duration: 6000,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        // Personagem: quicando de leve
        Animated.loop(
            Animated.sequence([
                Animated.timing(bob, {
                    toValue: 1,
                    duration: 1600,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(bob, {
                    toValue: 0,
                    duration: 1600,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        // Respiração/tilt sutil
        Animated.loop(
            Animated.sequence([
                Animated.timing(breathe, {
                    toValue: 1,
                    duration: 2200,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(breathe, {
                    toValue: 0,
                    duration: 2200,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [bgX, bob, breathe]);

    // mapeia valores
    const bgTranslateX = bgX.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -12], // move ~12px para esquerda (ajuste ao seu gosto)
    });

    const charTranslateY = bob.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -6], // quica 6px
    });

    const charRotate = breathe.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "-2.5deg"], // tilt bem sutil
    });

    const charScale = breathe.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02], // “respira” 2%
    });

    return (
        <Animated.View style={[styles.bgWrap, { transform: [{ translateX: bgTranslateX }] }]}>
            <ImageBackground source={bgSource} style={styles.bg} imageStyle={styles.bgImage} resizeMode="cover">
                {/* sombra “respirando” */}
                <Animated.View
                    style={[
                        styles.shadow,
                        {
                            transform: [{ scaleX: charScale }],
                            opacity: 0.25,
                        },
                    ]}
                />
                {/* personagem */}
                <Animated.Image
                    source={charSource}
                    style={[
                        styles.character,
                        {
                            transform: [
                                { translateY: charTranslateY },
                                { rotate: charRotate },
                                { scale: charScale },
                            ],
                        },
                    ]}
                    resizeMode="contain"
                />
            </ImageBackground>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    bgWrap: {
        // container animável do BG
    },
    bg: {
        width: "100%",
        height: 300,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    bgImage: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    character: {
        width: 220,
        height: 220,
        marginBottom: 16,
    },
    shadow: {
        position: "absolute",
        bottom: 24,
        width: 120,
        height: 16,
        borderRadius: 999,
        backgroundColor: "black",
    },
});
