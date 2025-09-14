// src/theme/index.ts
export const colors = {
    mascots: {
        lightCoral: "#F27D90",
        paleTurquoise: "#9BE8D8",
        navajoWhite: "#FFD6A5",
        lightSteelBlue: "#B5C7F7",
        thistle: "#EAC4D5",
    },
    ui: {
        background: "#EBEBEB",
        surface: "#FFFFFF",
        text: "#1E1E1E",
        inverse: "#6B7280", // usei um cinza p/ texto secundário
        border: "#E5E7EB",
    },
    brand: {
        primary: "#000000",
        onPrimary: "#FFFFFF",
        primaryHover: "#1F1F1F",
        primaryPressed: "#111111",
    },
    gray: {
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
    },
    black: "#1E1E1E",
    white: "#FFFFFF",
} as const;

export const spacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
} as const;

export const radii = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
} as const;

export const fonts = {
    family: {
        regular: "Poppins_400Regular",
        medium: "Poppins_500Medium",
        bold: "Poppins_700Bold",
        italic: "Poppins_400Regular", // sintético
    },
    size: {
        title: 32,
        subtitle: 24,
        body: 16,
        button: 16,
        caption: 12,
    },
    lineHeight: {
        title: 40,
        subtitle: 30,
        body: 24,
        button: 20,
    },
} as const;

export const textVariants = {
    title: {
        fontFamily: fonts.family.bold,
        fontSize: fonts.size.title,
        lineHeight: fonts.lineHeight.title,
        color: colors.ui.text,
    },
    subtitle: {
        fontFamily: fonts.family.medium,
        fontSize: fonts.size.subtitle,
        lineHeight: fonts.lineHeight.subtitle,
        color: colors.ui.text,
    },
    body: {
        fontFamily: fonts.family.regular,
        fontSize: fonts.size.body,
        lineHeight: fonts.lineHeight.body,
        color: colors.ui.text,
    },
    bodyItalic: {
        fontFamily: fonts.family.regular,
        fontSize: fonts.size.body,
        lineHeight: fonts.lineHeight.body,
        fontStyle: "italic",
        color: colors.ui.text,
    },
    button: {
        fontFamily: fonts.family.bold,
        fontSize: fonts.size.button,
        lineHeight: fonts.lineHeight.button,
        color: colors.white,
    },
} as const;

export const radius = {
    sm: 8,
    md: 16,
    lg: 24,
    full: 999,
};


// ---- Opcional: aliases de compatibilidade (se vc usava colors.text no app)
export const tokens = {
    text: colors.ui.text,
    background: colors.ui.background,
    surface: colors.ui.surface,
    border: colors.ui.border,
    inverseText: colors.ui.inverse,
} as const;

// Tipo do tema (útil em props)
export type Theme = {
    colors: typeof colors;
    spacing: typeof spacing;
    radius: typeof radius;
    radii: typeof radii;
    fonts: typeof fonts;
    textVariants: typeof textVariants;
    tokens: typeof tokens;
};
