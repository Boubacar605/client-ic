import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../api/client';

/** Lance une action (retenir, confirmer...), garde son état d'attente et son erreur, puis rafraîchit les données. */
export function useAct() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key); setError(null);
    try {
      await fn();
      await qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'reference' });
      return true;
    } catch (e) { setError(e as ApiError); return false; }
    finally { setBusy(null); }
  };
  return { run, busy, error, clear: () => setError(null) };
}
