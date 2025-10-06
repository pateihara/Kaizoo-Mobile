// components/atoms/Input.tsx
import { colors, spacing } from "@/theme";
import React, { forwardRef, useMemo, useState } from "react";
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputContentSizeChangeEventData, TextInputProps } from "react-native";

type Props = TextInputProps & {
    multiline?: boolean;
    /** Faz o campo crescer conforme o texto (até max) */
    autoGrow?: boolean;
    /** Altura mínima para multiline */
    multilineMinHeight?: number; // default: 120
    /** Altura máxima para multiline (passou disso, ativa scroll interno) */
    multilineMaxHeight?: number; // default: 220
};

const Input = forwardRef<TextInput, Props>(
    (
        {
            multiline,
            autoGrow,
            style,
            placeholderTextColor,
            multilineMinHeight = 120,
            multilineMaxHeight = 220,
            onContentSizeChange,
            scrollEnabled,
            ...rest
        },
        ref
    ) => {
        const enableAutoGrow = multiline && (autoGrow ?? true);

        // altura controlada quando autoGrow está ligado
        const [growHeight, setGrowHeight] = useState<number | undefined>(
            enableAutoGrow ? multilineMinHeight : undefined
        );

        const handleContentSizeChange = (
            e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
        ) => {
            if (enableAutoGrow) {
                const h = Math.max(multilineMinHeight, Math.ceil(e.nativeEvent.contentSize.height));
                setGrowHeight(Math.min(h, multilineMaxHeight));
            }
            onContentSizeChange?.(e);
        };

        const computedStyle = useMemo(() => {
            const base = [styles.base, style];

            if (multiline) {
                base.unshift(styles.multilineBase);
                if (enableAutoGrow && growHeight) {
                    base.push({ height: growHeight }); // cresce até o max
                } else {
                    base.push({ minHeight: multilineMinHeight }); // tamanho padrão
                }
            } else {
                base.unshift(styles.singleLineBase); // altura fixa só no single line
            }

            return base;
        }, [multiline, enableAutoGrow, growHeight, multilineMinHeight, style]);

        return (
            <TextInput
                ref={ref}
                {...rest}
                multiline={multiline}
                numberOfLines={multiline ? undefined : 1}
                onContentSizeChange={handleContentSizeChange}
                // quando atingir o max, habilita scroll interno
                scrollEnabled={
                    multiline
                        ? (scrollEnabled ?? !!(enableAutoGrow && growHeight && growHeight >= multilineMaxHeight))
                        : scrollEnabled
                }
                placeholderTextColor={placeholderTextColor ?? (colors.gray?.[600] ?? "#6B6B6B")}
                style={computedStyle}
            />
        );
    }
);
Input.displayName = "Input";

const styles = StyleSheet.create({
    base: {
        borderRadius: 28,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.gray?.[200] ?? "#EDEDED",
        color: "#111",
        alignSelf: "stretch",
        width: "100%",
        fontSize: 16,
    },
    singleLineBase: {
        height: 56,
    },
    multilineBase: {
        textAlignVertical: "top",
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
    },
});

export default Input;
