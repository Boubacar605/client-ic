import { deleteStorage, readStorage, writeStorage } from '../lib/storage';

// Les jetons restent dans le stockage sécurisé du téléphone.
const ACCESS = 'xs_access';
const REFRESH = 'xs_refresh';
let access: string | null = null;

export const tokens = {
  async load() {
    access = await readStorage(ACCESS);
    return { access, refresh: await readStorage(REFRESH) };
  },
  getAccess: () => access,
  getRefresh: () => readStorage(REFRESH),
  async save(a: string, r: string) {
    access = a;
    await writeStorage(ACCESS, a);
    await writeStorage(REFRESH, r);
  },
  async setAccess(a: string) {
    access = a;
    await writeStorage(ACCESS, a);
  },
  async clear() {
    access = null;
    await deleteStorage(ACCESS);
    await deleteStorage(REFRESH);
  },
};
