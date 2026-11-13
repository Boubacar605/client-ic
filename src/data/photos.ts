import type { ImageSourcePropType } from 'react-native';

// Photos de l'écran d'accueil (plein écran, format portrait conseillé : environ 1080 x 1920, moins de 400 Ko).
// Ajoutez l'image dans assets/accueil/ puis décommentez la ligne. Sans photo, un fond coloré avec icône s'affiche.
export const ACCUEIL_PHOTOS: Record<string, ImageSourcePropType> = {
  // 'accueil-1': require('../../assets/accueil/travailleurs.jpg'),
  // 'accueil-2': require('../../assets/accueil/recruteurs.jpg'),
  // 'accueil-3': require('../../assets/accueil/pour-tous.jpg'),
};
