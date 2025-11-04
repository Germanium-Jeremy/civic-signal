import { Platform } from 'react-native';

export const MainColors = {
  "Primary Blue": "#0B3954",
  "Neutral Gray": "#4F5D75",
  "Accent Green": "#00A896",
  "Secondary Green": "#02C39A",
  "Light Gray": "#EAEDF0",
  "Main Background": "#FFFFFF",
  "Error red": "#E63946",
  "Warning Yellow": "#FFB703",
  "Almost Black": "#010D15",
};

export const Fonts = Platform.select({
  ios: {
    sans: "EBGaramond",
    serif: "EBGaramond",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "EBGaramond",
    serif: "EBGaramond",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "EBGaramond, 'EB Garamond', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'EB Garamond', EBGaramond, Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
