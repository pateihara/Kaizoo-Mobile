// src/theme/index.ts
export const colors = {
    // Paleta do design
    mascots: {
        lightCoral: "#F27D90",
        paleTurquoise: "#9BE8D8",
        navajoWhite: "#FFD6A5",
        lightSteelBlue: "#B5C7F7",
        thistle: "#EAC4D5",
    },
    ui: {
        background: "#EBEBEB", // WhiteSmoke → fundo da interface
        surface: "#FFFFFF", // cards, inputs
        text: "#1E1E1E", // Black → texto principal
        inverse: "#FFFFFF",
        border: "#E5E7EB",
    },
    brand: {
        primary: "#9BE8D8", // destaque/ação (PaleTurquoise)
        onPrimary: "#1E1E1E",
        // opcionais para estados
        primaryHover: "#7EDFD0",
        primaryPressed: "#63D7C7",
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
};

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
        // se quiser itálico real depois, adicione Poppins_400Italic e troque aqui
        italic: "Poppins_400Regular",
    },
    size: {
        title: 32,      // Título
        subtitle: 24,   // Subtítulo
        body: 16,       // Corpo 1 e 2
        button: 16,
        caption: 12,
    },
    lineHeight: {
        title: 40,
        subtitle: 30,
        body: 24,
        button: 20,
    },
};

// Variantes prontas para seu <Text />
export const textVariants = {
    title: {
        fontFamily: "Poppins_700Bold",
        fontSize: 32,
        lineHeight: 40,
        color: colors.ui.text,
    },
    subtitle: {
        fontFamily: "Poppins_500Medium",
        fontSize: 24,
        lineHeight: 30,
        color: colors.ui.text,
    },
    body: {
        fontFamily: "Poppins_400Regular",
        fontSize: 16,
        lineHeight: 24,
        color: colors.ui.text,
    },
    bodyItalic: {
        fontFamily: "Poppins_400Regular",
        fontSize: 16,
        lineHeight: 24,
        fontStyle: "italic", // (sintético até instalar face italic)
        color: colors.ui.text,
    },
    button: {
        fontFamily: "Poppins_700Bold",
        fontSize: 16,
        lineHeight: 20,
        color: colors.white,
    },
} as const;
