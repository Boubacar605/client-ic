import type { ImageSourcePropType } from 'react-native';

// Pour afficher une vraie photo à la place de l'icône : ajoutez l'image dans assets/metiers/
// puis décommentez (ou ajoutez) la ligne du métier. Le nom doit être identique à celui de metiers.ts.
// Les métiers sans photo gardent leur icône.
export const METIER_PHOTOS: Record<string, ImageSourcePropType> = {
  // 'Maçon': require('../../assets/metiers/macon.jpg'),
  // 'Manœuvre': require('../../assets/metiers/manoeuvre.jpg'),
  // 'Lessiveuse': require('../../assets/metiers/lessiveuse.jpg'),
  // 'Repasseuse': require('../../assets/metiers/repasseuse.jpg'),
  // 'Jardinier': require('../../assets/metiers/jardinier.jpg'),
  // 'Aide-ménagère': require('../../assets/metiers/aide-menagere.jpg'),
  // 'Manutentionnaire': require('../../assets/metiers/manutentionnaire.jpg'),
};
