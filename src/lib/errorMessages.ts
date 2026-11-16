/**
 * Messages destinés à l'utilisateur final.
 * Aucun code HTTP, identifiant technique ou message backend brut ne doit atteindre l'écran.
 */

const BY_CODE: Record<string, string> = {
  EMAIL_NOT_CONFIRMED: 'Confirmez votre adresse e-mail avant de vous connecter. Le lien de confirmation vous a été envoyé.',
  EMAIL_ALREADY_CONFIRMED: 'Cette adresse e-mail est déjà confirmée. Vous pouvez vous connecter.',
  EMAIL_CONFIRMATION_FAILED: 'L’e-mail de confirmation n’a pas pu être envoyé. Patientez un instant puis réessayez.',
  INVALID_CONFIRMATION_LINK: 'Ce lien de confirmation n’est plus valide. Demandez un nouvel e-mail depuis l’écran de connexion.',
  INVALID_CREDENTIALS: 'E-mail ou mot de passe incorrect.',
  PREMIUM_REQUIRED: 'Cette fonctionnalité est réservée aux comptes Premium. Demandez son activation à un administrateur.',
  ROLE_REFUSE: 'Ce compte ne dispose pas des droits administrateur.',
  CANNOT_SUSPEND_SELF: 'Vous ne pouvez pas désactiver votre propre compte administrateur.',
  COMMISSION_PAYMENT_REQUIRED: 'Veuillez régulariser vos commissions avant de postuler ou de recevoir de nouvelles missions. Demandez un échéancier à un administrateur.',
  WHATSAPP_SEND_FAILED: 'Le message WhatsApp n’a pas pu être envoyé. Vérifiez le numéro puis réessayez.',
};

/** Cas métier fréquents : le message backend sert seulement à choisir un texte français. */
const BY_SERVER_MESSAGE: [RegExp, string][] = [
  [/email.*not confirmed|not confirmed/i, BY_CODE.EMAIL_NOT_CONFIRMED],
  [/invalid login credentials|invalid credentials|email or password/i, BY_CODE.INVALID_CREDENTIALS],
  [/already exists with this email|email already (exists|registered)/i, 'Un compte existe déjà avec cette adresse e-mail.'],
  [/availability already exists/i, 'Vous êtes déjà disponible sur ce créneau.'],
  [/already applied/i, 'Vous avez déjà postulé à cette mission.'],
  [/mission is full|no remaining seats/i, 'Cette mission est complète : plus aucune place n’est disponible.'],
  [/mission is closed|does not accept (applications|proposals)|no longer active/i, 'Cette mission est clôturée et n’accepte plus de réponses.'],
  [/mission is over.*withdrawn|can no longer be withdrawn|cannot be withdrawn/i, 'Cette candidature ne peut plus être retirée.'],
  [/only an in-progress mission/i, 'La mission doit être en cours pour être terminée.'],
  [/commissions can only be generated/i, 'Les commissions se génèrent après la fin de la mission.'],
  [/payments can only be recorded/i, 'Les paiements ne peuvent être enregistrés que pour une mission terminée.'],
  [/confirmed candidates cannot be deleted/i, 'Cette mission a des candidats confirmés : elle ne peut pas être supprimée.'],
  [/invalid mission status transition|unsupported mission status|cannot be modified/i, 'Cette mission ne peut pas être modifiée à cette étape.'],
  [/already processed|invalid application status transition|already been confirmed/i, 'Cette candidature a déjà été traitée.'],
  [/nombrepostes cannot be lower/i, 'Le nombre de postes ne peut pas être inférieur aux candidats déjà confirmés.'],
  [/cannot be in the past|past date/i, 'Choisissez une date à partir d’aujourd’hui.'],
  [/heure.*required|invalid time value|mission time is invalid/i, 'Les horaires indiqués ne sont pas valides.'],
  [/heurefin must be later/i, 'L’heure de fin doit être après l’heure de début.'],
  [/worker account is not active/i, 'Ce compte travailleur n’est pas actif.'],
  [/you do not own this mission/i, 'Vous ne pouvez pas modifier une mission qui ne vous appartient pas.'],
  [/administrator role required|only recruiters and agents|only workers and recruiters|no dashboard is available/i, 'Cette action n’est pas autorisée pour votre profil.'],
  [/select between 1 and 15|select up to 15/i, 'Sélectionnez entre 1 et 15 travailleurs.'],
  [/worker phone number is missing/i, 'Ce travailleur n’a pas renseigné de numéro de téléphone.'],
  [/workerids are required|workerid is required|applicationid is required/i, 'Sélectionnez un travailleur et une mission.'],
  [/application changed concurrently/i, 'La candidature a changé entre-temps. Rechargez puis réessayez.'],
  [/cannot accept the whatsapp proposal/i, 'Cette candidature ne peut plus recevoir de proposition.'],
  [/only a selected application can be declined/i, 'Seule une candidature retenue peut être refusée.'],
  [/only a selected worker can receive/i, 'Seuls les travailleurs retenus peuvent recevoir ce message.'],
  [/reminders can only be sent/i, 'Seuls les travailleurs confirmés peuvent recevoir un rappel.'],
  [/every selected worker must be active|worker is not managed by this agent/i, 'Certains travailleurs sélectionnés ne sont plus disponibles pour cette mission.'],
  [/already proposed for the mission/i, 'Ce travailleur est déjà proposé pour cette mission.'],
  [/already fully paid/i, 'Cette commission est déjà entièrement réglée.'],
  [/payment amount exceeds/i, 'Le montant dépasse le reste à payer de cette commission.'],
  [/profile picture file is required/i, 'Choisissez d’abord une photo.'],
  [/unsupported.*(format|type)|invalid.*mime/i, 'Ce format de fichier n’est pas pris en charge.'],
  [/unique referral code/i, 'Le code de parrainage n’a pas pu être généré. Réessayez.'],
  [/referral code (not found|is invalid|unknown)/i, 'Ce code agent est introuvable. Vérifiez-le auprès de votre agent, ou inscrivez-vous sans code.'],
  [/mission is not active|not active for broadcast/i, 'Cette mission n’est plus active.'],
  [/password reset token/i, 'Ce lien de réinitialisation n’est plus valide. Demandez un nouveau lien.'],
];

const GENERIC = 'Une erreur est survenue. Réessayez dans un instant.';

/** Filet de sécurité : aucun texte technique ne doit atteindre l'écran, même si un appelant passe un message brut. */
const TECHNICAL = /https?:\/\/|\bHTTP\b|\bHTTP_\d|\bstatusCode\b|status\s+code|ECONN|ETIMEDOUT|Axios|Prisma|Supabase|\bException\b|\bError\b|\[object |^\s*at\s/i;

export function userSafeTitle(title: string): string {
  if (!title || TECHNICAL.test(title)) return GENERIC;
  return title;
}

export function serverErrorMessage(status: number, code?: string, rawMessage?: string): string {
  if (code && BY_CODE[code]) return BY_CODE[code];
  if (rawMessage) {
    const match = BY_SERVER_MESSAGE.find(([re]) => re.test(rawMessage));
    if (match) return match[1];
  }
  switch (status) {
    case 400:
    case 422:
      return 'Certaines informations ne sont pas valides. Vérifiez-les puis réessayez.';
    case 401:
      return 'Votre session n’est plus valide. Reconnectez-vous pour continuer.';
    case 403:
      return 'Cette action n’est pas autorisée avec votre compte.';
    case 404:
      return 'Cet élément est introuvable ou n’est plus disponible.';
    case 408:
      return 'Le serveur met trop de temps à répondre. Réessayez dans un instant.';
    case 409:
      return 'Cette action n’est plus possible : les informations ont changé entre-temps. Rechargez puis réessayez.';
    case 413:
      return 'Le fichier envoyé est trop volumineux.';
    case 429:
      return 'Trop de tentatives. Patientez un instant avant de réessayer.';
    case 500:
      return 'Une erreur inattendue est survenue. Réessayez dans un instant.';
    case 502:
    case 503:
    case 504:
      return 'Le service est momentanément indisponible. Réessayez dans quelques instants.';
    default:
      return GENERIC;
  }
}

export function networkErrorMessage(code?: string): string {
  if (code === 'DELAI') return 'Le serveur met trop de temps à répondre. Vérifiez votre connexion puis réessayez.';
  return 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
}

const FIELD_MESSAGES: Record<string, string> = {
  email: 'Saisissez une adresse e-mail valide.',
  password: 'Saisissez un mot de passe valide.',
  newPassword: 'Choisissez un mot de passe de 8 caractères minimum.',
  confirmPassword: 'Les mots de passe ne correspondent pas.',
  confirmationPassword: 'Les mots de passe ne correspondent pas.',
  currentPassword: 'Saisissez votre mot de passe actuel.',
  nom: 'Saisissez votre nom complet.',
  telephone: 'Saisissez un numéro mobile sénégalais valide (+221 7X XXX XX XX).',
  raisonSociale: 'Saisissez la raison sociale.',
  typeRecruteur: 'Choisissez un type de compte.',
  langue: 'Choisissez une langue.',
  metierId: 'Choisissez un métier.',
  zoneId: 'Choisissez un lieu.',
  lieu: 'Le lieu doit faire 255 caractères au plus.',
  nombrePostes: 'Indiquez un nombre de personnes entre 1 et 50.',
  dateMission: 'Choisissez une date à partir d’aujourd’hui.',
  dateDisponibilite: 'Choisissez une date valide.',
  heureDebut: 'Choisissez une heure de début.',
  heureFin: 'L’heure de fin doit être après l’heure de début.',
  typeHoraire: 'Choisissez une durée.',
  remunerationFcfa: 'Indiquez un montant en FCFA.',
  description: 'Vérifiez la description.',
  message: 'Vérifiez le contenu du message.',
  role: 'Choisissez un rôle.',
  statut: 'Choisissez un statut.',
  workerIds: 'Sélectionnez au moins un travailleur.',
  agentReferralCode: 'Ce code agent est introuvable. Vérifiez-le ou laissez le champ vide.',
  token: 'Ce lien n’est plus valide. Demandez un nouvel e-mail.',
};

export function friendlyFieldMessage(field?: string): string {
  const key = (field ?? '').split('.').pop() ?? '';
  return FIELD_MESSAGES[key] ?? 'Cette valeur n’est pas valide.';
}
