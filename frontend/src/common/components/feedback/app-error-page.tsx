import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Button } from '@/common/components/ui/button';

export function AppErrorPage() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Terjadi kendala pada aplikasi';

  const description = isRouteErrorResponse(error)
    ? error.data?.message ?? 'Halaman yang diminta tidak dapat dimuat.'
    : error instanceof Error
      ? error.message
      : 'Ada error tak terduga. Silakan kembali ke dashboard atau muat ulang halaman.';

  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <div className="glass mx-auto max-w-2xl rounded-[32px] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.28em] theme-muted">Application Error</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight theme-text md:text-3xl">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 theme-muted md:text-base">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
          <Link to="/dashboard">
            <Button variant="secondary">Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
