import { Link } from 'react-router-dom';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { LandingShell } from '@/modules/landing/components/landing-shell';
import { ThemeLogo } from '@/common/components/ui/theme-logo';
import { ThemeToggle } from '@/common/components/ui/theme-toggle';

const introItems = [
  {
    title: 'Monitoring',
    text: 'Pantau work order, progres servis, dan status kendaraan dalam satu tampilan.',
  },
  {
    title: 'Koordinasi',
    text: 'Frontdesk, manajer, admin, dan mekanik bekerja pada alur yang sama.',
  },
  {
    title: 'Riwayat',
    text: 'Status, catatan mekanik, dan timeline pekerjaan dapat ditinjau kembali.',
  },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingShell>
        <div className="flex justify-end pt-4">
          <ThemeToggle />
        </div>
        <div className="space-y-8 py-4 md:space-y-10 md:py-6">
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-stretch">
            <Card className="relative overflow-hidden p-6 md:p-8 xl:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,190,137,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(155,193,255,0.14),transparent_38%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div className="space-y-5">
                  <ThemeLogo large alt="JAECOO" className="h-10 w-auto opacity-95 md:h-12" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] theme-muted">JAECOO Yogyakarta</p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl xl:text-6xl">
                      <span className="text-gradient">Service Management System</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 theme-muted md:text-base">
                      Sistem manajemen internal terpusat yang membantu meringankan beban pekerjaan mengenai informasi terkait bagian workshop JAECOO Yogyakarta. 
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button className="h-14 w-full min-w-[260px] px-12 text-base font-semibold shadow-[0_18px_44px_rgba(212,169,82,0.28)] sm:w-auto">
                      Masuk Sistem
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="overflow-hidden p-0">
                <img src="/assets/img11.jpeg" alt="JAECOO" className="h-[240px] w-full rounded-xl object-cover transition duration-700 hover:scale-[1.03] md:h-[280px] xl:h-full" />
              </Card>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {introItems.map((item) => (
              <Card key={item.title} className="h-full animate-fade-up">
                <p className="text-xs uppercase tracking-[0.22em] theme-muted">{item.title}</p>
                <p className="mt-4 text-base leading-7 theme-text">{item.text}</p>
              </Card>
            ))}
          </section>

        </div>
      </LandingShell>

      <footer className="mt-10 border-t border-[color:var(--line)] bg-[color:var(--panel-light)]/35 backdrop-blur-md">
        <LandingShell>
          <div className="grid gap-8 py-8 md:grid-cols-[1.1fr_1fr_1fr] md:py-10">
            <div>
              <p className="text-lg font-semibold theme-text">JAECOO Service Management</p>
              <p className="mt-2 text-sm theme-muted">Yogyakarta</p>
            </div>
          </div>

          <div className="border-t border-[color:var(--line)] py-4 text-sm theme-muted md:flex md:items-center md:justify-between">
            <div>© 2026 JAECOO</div>
            <div className="mt-2 md:mt-0">JAECOO Yogyakarta Service Management System</div>
          </div>
        </LandingShell>
      </footer>
    </div>
  );
}
