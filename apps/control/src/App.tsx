import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type HealthState = {
  status: string;
  environment: string;
  uptime: number;
  timestamp: string;
};

const languages = [
  { code: 'pt-BR', label: 'PT-BR' },
  { code: 'en-US', label: 'EN-US' },
  { code: 'es-ES', label: 'ES-ES' },
];

export default function App() {
  const { t, i18n } = useTranslation();
  const [health, setHealth] = useState<HealthState | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const apiBase = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:3001', []);

  const currentLang = useMemo(() => i18n.resolvedLanguage || i18n.language, [i18n]);

  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const response = await fetch(`${apiBase}/health`);
      if (!response.ok) {
        throw new Error(`Backend respondeu ${response.status}`);
      }
      const payload = await response.json();
      setHealth(payload);
    } catch (error: any) {
      setHealth(null);
      setHealthError(error?.message || 'Backend indisponível');
    } finally {
      setLoadingHealth(false);
    }
  }, [apiBase]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">BTRIX Control</p>
            <h1 className="text-2xl font-semibold text-white">{t('dashboard.title')}</h1>
          </div>
          <div className="flex items-center gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  currentLang === lang.code
                    ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/30'
                    : 'border border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <p className="text-sm text-slate-400">{t('dashboard.welcome')}</p>
            <h2 className="mt-2 text-lg font-semibold text-white">{t('orders.title')}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Interface de verificação rápida para garantir que API, i18n e frontend estão respondendo.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Backend</p>
              <button
                onClick={checkHealth}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-emerald-400 hover:text-white"
                disabled={loadingHealth}
              >
                {loadingHealth ? t('common.loading') : 'Recarregar'}
              </button>
            </div>
            {health && (
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-emerald-400">Status: {health.status}</p>
                <p className="text-slate-300">Env: {health.environment}</p>
                <p className="text-slate-400">Uptime: {health.uptime.toFixed(2)}s</p>
                <p className="text-slate-500 text-xs">Última verificação: {new Date(health.timestamp).toLocaleString()}</p>
              </div>
            )}
            {healthError && (
              <p className="mt-3 text-sm text-amber-400">
                {t('common.error')}: {healthError}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <p className="text-sm font-semibold text-white">Login de teste</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>Admin: admin@btrix.com / admin123</p>
              <p>Staff: staff@btrix.com / staff123</p>
              <p>Kitchen: kitchen@btrix.com / kitchen123</p>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Tokens de acesso expiram em ~15 minutos. Use o endpoint /api/auth/refresh para renovar.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <p className="text-sm font-semibold text-white">i18n</p>
            <p className="mt-2 text-sm text-slate-300">
              {t('orders.status.pending')} · {t('orders.status.ready')} · {t('orders.status.completed')}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Mudança de idioma persiste via localStorage. As traduções usam fallback para pt-BR.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <p className="text-sm font-semibold text-white">Links úteis</p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-300">
              <li>API Docs: <span className="text-slate-100">http://localhost:3001/api-docs</span></li>
              <li>Healthcheck: <span className="text-slate-100">/health</span></li>
              <li>WebSocket: <span className="text-slate-100">ws://localhost:3001 (Bearer token)</span></li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              O frontend evita quebrar se o backend estiver offline; mensagens de erro são exibidas acima.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
