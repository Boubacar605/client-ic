// Journal des derniers appels, affiché dans l'écran Diagnostic.
export type LogEntry = { t: number; method: string; url: string; status: number | string; ms: number; req?: string; res?: string };
const buf: LogEntry[] = [];
export const addLog = (e: LogEntry) => { buf.unshift(e); if (buf.length > 40) buf.pop(); };
export const getLogs = () => buf.slice();
export const clearLogs = () => { buf.length = 0; };
