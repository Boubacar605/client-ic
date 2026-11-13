import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = { tablet: 768, desktop: 1024 } as const;

/** Dimensions utiles pour adapter les écrans mobiles, tablettes et desktop. */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  return {
    width,
    height,
    isTablet,
    isDesktop,
    columns: width >= 1100 ? 3 : width >= 760 ? 2 : 1,
    contentWidth: Math.min(width, 1120),
    gutter: isTablet ? 28 : 20,
  };
}
