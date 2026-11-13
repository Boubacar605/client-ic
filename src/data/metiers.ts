import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';

export type MetierIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface MetierDef {
  nom: string;
  icon: MetierIcon;
  couleur: string;
  categorie: string;
  motsCles?: string[];
}

/** Référentiel visuel des métiers : icône + couleur + catégorie. */
export const METIERS: MetierDef[] = [
  // Construction & BTP
  { nom: 'Maçon', icon: 'wall', couleur: '#c2763a', categorie: 'Construction', motsCles: ['macon', 'beton', 'ciment'] },
  { nom: 'Menuisier', icon: 'saw-blade', couleur: '#9a6b3f', categorie: 'Construction', motsCles: ['menuiserie', 'bois'] },
  { nom: 'Charpentier', icon: 'home-roof', couleur: '#8a5a2b', categorie: 'Construction', motsCles: ['charpente', 'toit'] },
  { nom: 'Ferrailleur', icon: 'nail', couleur: '#7a7f85', categorie: 'Construction', motsCles: ['fer', 'armature'] },
  { nom: 'Plombier', icon: 'pipe-wrench', couleur: '#2f7fbf', categorie: 'Construction', motsCles: ['plomberie', 'tuyau'] },
  { nom: 'Électricien', icon: 'lightning-bolt', couleur: '#e0a800', categorie: 'Construction', motsCles: ['electricite', 'cable'] },
  { nom: 'Peintre', icon: 'format-paint', couleur: '#b35c9e', categorie: 'Construction', motsCles: ['peinture'] },
  { nom: 'Carreleur', icon: 'grid', couleur: '#4f8a8b', categorie: 'Construction', motsCles: ['carrelage', 'faience'] },
  { nom: 'Soudeur', icon: 'torch', couleur: '#d4712f', categorie: 'Construction', motsCles: ['soudure'] },
  { nom: 'Manœuvre', icon: 'account-hard-hat', couleur: '#d9a516', categorie: 'Construction', motsCles: ['manoeuvre', 'chantier'] },
  { nom: 'Conducteur d’engins', icon: 'excavator', couleur: '#a8792c', categorie: 'Construction', motsCles: ['engin', 'pelleteuse', 'tracteur'] },

  // Maison & services
  { nom: 'Aide-ménagère', icon: 'broom', couleur: '#d4577a', categorie: 'Maison', motsCles: ['menage', 'menagere', 'nettoyage'] },
  { nom: 'Lessiveuse', icon: 'washing-machine', couleur: '#3b82c4', categorie: 'Maison', motsCles: ['lessive', 'linge'] },
  { nom: 'Repasseuse', icon: 'iron', couleur: '#8e5bb5', categorie: 'Maison', motsCles: ['repassage'] },
  { nom: 'Cuisinière', icon: 'chef-hat', couleur: '#c94c3b', categorie: 'Maison', motsCles: ['cuisinier', 'cuisine', 'cuisiniere'] },
  { nom: 'Nounou', icon: 'baby-face-outline', couleur: '#e08a3c', categorie: 'Maison', motsCles: ['garde enfant', 'nounou', 'baby-sitter'] },
  { nom: 'Aide-soignant', icon: 'hand-heart', couleur: '#3d9a8a', categorie: 'Santé', motsCles: ['soin', 'aide soignant'] },
  { nom: 'Jardinier', icon: 'shovel', couleur: '#3d9a5a', categorie: 'Maison', motsCles: ['jardin', 'espaces verts'] },
  { nom: 'Gardien', icon: 'shield-account', couleur: '#4a6b8a', categorie: 'Sécurité', motsCles: ['vigile', 'gardiennage', 'securite'] },
  { nom: 'Agent de sécurité', icon: 'shield-account-outline', couleur: '#39536b', categorie: 'Sécurité', motsCles: ['securite', 'vigile'] },
  { nom: 'Agent d’entretien', icon: 'spray-bottle', couleur: '#2f9e8f', categorie: 'Maison', motsCles: ['entretien', 'proprete'] },

  // Transport & logistique
  { nom: 'Chauffeur', icon: 'truck', couleur: '#41627a', categorie: 'Transport', motsCles: ['chauffeur', 'conducteur', 'taxi'] },
  { nom: 'Livreur', icon: 'moped', couleur: '#c2703a', categorie: 'Transport', motsCles: ['livraison', 'coursier'] },
  { nom: 'Mécanicien', icon: 'wrench', couleur: '#5d6b7a', categorie: 'Transport', motsCles: ['mecanique', 'garage', 'auto'] },
  { nom: 'Manutentionnaire', icon: 'package-variant-closed', couleur: '#5d7a8c', categorie: 'Logistique', motsCles: ['manutention', 'colis', 'depot'] },
  { nom: 'Magasinier', icon: 'warehouse', couleur: '#6b705c', categorie: 'Logistique', motsCles: ['magasin', 'stock'] },

  // Commerce & vente
  { nom: 'Vendeur', icon: 'storefront', couleur: '#c25d8a', categorie: 'Commerce', motsCles: ['vente', 'boutique', 'vendeuse'] },
  { nom: 'Caissier', icon: 'cash-register', couleur: '#3d8a62', categorie: 'Commerce', motsCles: ['caisse', 'caissiere'] },
  { nom: 'Commercial', icon: 'briefcase', couleur: '#2f6f9e', categorie: 'Commerce', motsCles: ['vente', 'commercial'] },
  { nom: 'Serveur', icon: 'room-service', couleur: '#b0763c', categorie: 'Restauration', motsCles: ['restaurant', 'service'] },
  { nom: 'Barman', icon: 'glass-cocktail', couleur: '#8a5da8', categorie: 'Restauration', motsCles: ['bar', 'boisson'] },

  // Beauté & artisanat
  { nom: 'Coiffeur', icon: 'content-cut', couleur: '#c94c8a', categorie: 'Beauté', motsCles: ['coiffure', 'coiffeuse'] },
  { nom: 'Couturier', icon: 'needle', couleur: '#a35d8a', categorie: 'Artisanat', motsCles: ['couture', 'couturiere', 'tailleur'] },
  { nom: 'Cordonnier', icon: 'shoe-print', couleur: '#7a5a3c', categorie: 'Artisanat', motsCles: ['chaussure', 'cordonnerie'] },

  // Agriculture
  { nom: 'Agriculteur', icon: 'sprout', couleur: '#4a8a3c', categorie: 'Agriculture', motsCles: ['agriculture', 'champ', 'culture'] },
  { nom: 'Éleveur', icon: 'cow', couleur: '#8a6b3c', categorie: 'Agriculture', motsCles: ['elevage', 'betail'] },
  { nom: 'Pêcheur', icon: 'fish', couleur: '#2f7f9e', categorie: 'Agriculture', motsCles: ['peche', 'poisson'] },

  // Bureautique & numérique
  { nom: 'Secrétaire', icon: 'desk', couleur: '#557a8a', categorie: 'Bureau', motsCles: ['secretariat', 'assistant'] },
  { nom: 'Comptable', icon: 'calculator', couleur: '#3d6b8a', categorie: 'Bureau', motsCles: ['comptabilite', 'finance'] },
  { nom: 'Réceptionniste', icon: 'phone-in-talk', couleur: '#6b5d8a', categorie: 'Bureau', motsCles: ['accueil', 'reception'] },
  { nom: 'Informaticien', icon: 'laptop', couleur: '#3b6fb0', categorie: 'Numérique', motsCles: ['informatique', 'support'] },
  { nom: 'Développeur', icon: 'code-tags', couleur: '#2f5d8a', categorie: 'Numérique', motsCles: ['developpement', 'web', 'mobile'] },
  { nom: 'Graphiste', icon: 'palette', couleur: '#b05d8a', categorie: 'Numérique', motsCles: ['design', 'graphisme'] },
  { nom: 'Photographe', icon: 'camera', couleur: '#4a4a5a', categorie: 'Numérique', motsCles: ['photo', 'video'] },

  // Santé & éducation
  { nom: 'Infirmier', icon: 'medical-bag', couleur: '#c94c5b', categorie: 'Santé', motsCles: ['infirmiere', 'soin'] },
  { nom: 'Pharmacien', icon: 'pill', couleur: '#3d9a6b', categorie: 'Santé', motsCles: ['pharmacie'] },
  { nom: 'Enseignant', icon: 'school', couleur: '#3d6b9e', categorie: 'Éducation', motsCles: ['professeur', 'prof', 'education'] },
];

/** Icône par défaut quand aucun métier ne correspond. */
export const DEFAULT_METIER: MetierDef = { nom: 'Métier', icon: 'account-hard-hat', couleur: '#5d7a8c', categorie: 'Autre' };

export const normalizeMetier = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Retrouve l'icône et la couleur d'un métier, sans tenir compte des accents ni des majuscules. */
export function metierDef(nom?: string): MetierDef | undefined {
  if (!nom) return undefined;
  const target = normalizeMetier(nom);
  const exact = METIERS.find((m) => normalizeMetier(m.nom) === target);
  if (exact) return exact;
  const keyword = METIERS.find((m) =>
    [m.nom, ...(m.motsCles ?? [])].some((word) => {
      const normalized = normalizeMetier(word);
      return target.includes(normalized) || normalized.includes(target);
    }),
  );
  return keyword ?? DEFAULT_METIER;
}

/** Catégories présentes dans le référentiel, dans l'ordre d'apparition. */
export const METIER_CATEGORIES = Array.from(new Set(METIERS.map((m) => m.categorie)));
