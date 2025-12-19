import { StyleSheet, Platform } from 'react-native';
import colors from './colors';

// Configuration for consistent spacing and layout
const LAYOUT = {
    spacing: 20,
    radius: 16,
    cardBorderWidth: 1,
};

// Base styles for reuse
const baseText = {
    color: colors.textPrimary,
};

const monospaceFont = Platform.select({
    ios: { fontFamily: 'Menlo' },
    android: { fontFamily: 'monospace' },
});

export default StyleSheet.create({
    // ============================================================
    // LAYOUT CONTAINERS
    // ============================================================
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: LAYOUT.spacing,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },

    // ============================================================
    // HEADER SECTION
    // ============================================================
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: LAYOUT.spacing,
        paddingVertical: LAYOUT.spacing,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        ...baseText,
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    headerIcon: {
        fontSize: 32,
    },

    // ============================================================
    // CARDS (Base & Specifics)
    // ============================================================
    // Base style for all cards to ensure consistency
    cardBase: {
        backgroundColor: colors.cardBackground,
        borderRadius: LAYOUT.radius,
        borderWidth: LAYOUT.cardBorderWidth,
        borderColor: colors.cardBorder,
        padding: LAYOUT.spacing,
        marginBottom: 16,
    },

    // Specific Card Implementations
    card: {
        // Inherits cardBase properties via composition in component
        backgroundColor: colors.cardBackground,
        borderRadius: LAYOUT.radius,
        padding: LAYOUT.spacing,
        marginBottom: 16,
        borderWidth: LAYOUT.cardBorderWidth,
        borderColor: colors.cardBorder,
    },
    cardCompact: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: LAYOUT.cardBorderWidth,
        borderColor: colors.cardBorder,
    },
    distanceCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: LAYOUT.radius,
        padding: LAYOUT.spacing,
        marginBottom: 12,
        borderWidth: LAYOUT.cardBorderWidth,
        borderColor: colors.cardBorder,
        alignItems: 'center',
        // Shadow for depth (optional improvement)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    errorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        gap: 12,
    },

    // ============================================================
    // TYPOGRAPHY & DATA DISPLAY
    // ============================================================
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    cardTitle: {
        ...baseText,
        fontSize: 18,
        fontWeight: '600',
    },

    // Distance Display
    distanceLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        textTransform: 'uppercase', // Improved readability
        letterSpacing: 1,
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    distanceValue: {
        fontSize: 52,
        fontWeight: 'bold',
        color: colors.accent,
        ...monospaceFont,
    },
    distanceUnit: {
        fontSize: 24,
        color: colors.textSecondary,
        fontWeight: '500',
        marginLeft: 8,
    },
    positionCount: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 8,
    },

    // Coordinates Grid
    coordsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    coordItem: {
        width: '48%',
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.03)', // Subtle background for data points
        padding: 8,
        borderRadius: 8,
    },
    coordLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        marginBottom: 4,
    },
    coordValue: {
        color: colors.accent,
        fontSize: 14,
        fontWeight: '600',
        ...monospaceFont,
    },

    // ============================================================
    // STATUS INDICATORS & BADGES
    // ============================================================
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 12,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        gap: 6,
    },
    statusChipText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: '500',
    },
    trackingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff4444',
    },

    // ============================================================
    // BUTTONS & INTERACTIONS
    // ============================================================
    buttonContainer: {
        marginTop: 'auto',
        paddingTop: 20,
    },
    trackButton: { // Consolidated button style
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: LAYOUT.radius,
        gap: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    startBtn: {
        backgroundColor: colors.accent, // Assuming gradient is handled in component or fallback here
        shadowColor: colors.accent,
    },
    stopBtn: {
        backgroundColor: colors.error,
        shadowColor: colors.error,
    },
    btnText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
    },

    // ============================================================
    // UTILITIES
    // ============================================================
    loadingText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        flex: 1,
    },
    serverInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
        opacity: 0.7, // Visual hierarchy
    },
    serverInfoText: { // Combined label/value for simplicity if needed
        color: colors.textTertiary,
        fontSize: 12,
    },
});