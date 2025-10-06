//src/theme/typography.ts
export const fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    "2xl": 28,
};

export const fontWeights = {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
};

export const typography = {
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 18, fontWeight: "600" },
    body: { fontSize: 16, fontWeight: "400" },
    button: { fontSize: 16, fontWeight: "600", textTransform: "uppercase" },
};
