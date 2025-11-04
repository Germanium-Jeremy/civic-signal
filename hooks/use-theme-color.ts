/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { MainColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(props: { light?: string; dark?: string }, colorName: keyof typeof MainColors["Main Background"] & keyof typeof MainColors["Almost Black"]) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return MainColors["Main Background"];
  }
}
