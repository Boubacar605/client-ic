// Style inspiré de DakarGo : fonds clairs et aérés, grandes formes arrondies, vert profond.
export const light = {
  bg: '#f3f6f2', card: '#ffffff', text: '#15221d', muted: '#62716a', line: '#e1e8e3',
  brand: '#0f6b5c', onBrand: '#ffffff', soft: '#dff0e8', sun: '#f2b705', sunSoft: '#fff3cc',
  error: '#b3261e', errorSoft: '#fbe9e7', blue: '#1565c0', amber: '#a35f00', green: '#1b7a3a',
  tabBar: '#ffffff',
};
export type Theme = typeof light;
export const dark: Theme = {
  bg: '#0d1512', card: '#17221e', text: '#e8f0ed', muted: '#9bb0a8', line: '#2a3a34',
  brand: '#3fb59f', onBrand: '#07130f', soft: '#1c3a33', sun: '#f2b705', sunSoft: '#3a3110',
  error: '#f2b8b5', errorSoft: '#3b1e1c', blue: '#7fb8f5', amber: '#ffc666', green: '#7fd69a',
  tabBar: '#1b2823',
};
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { md: 14, lg: 20, xl: 26, pill: 999 };
