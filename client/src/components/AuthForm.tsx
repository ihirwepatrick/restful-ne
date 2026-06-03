'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import ThemeToggle from '@/components/ThemeToggle';
import AuthImageCarousel from '@/components/auth/AuthImageCarousel';
import { buttonClass } from '@/components/Button';
import { NavIcons } from '@/lib/nav-icons';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthForm({ title, subtitle, children, footer }: AuthFormProps) {
  return (
    <div className="relative min-h-screen bg-[var(--auth-bg)] text-[var(--text-primary)] flex flex-col transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="flex-1 grid lg:grid-cols-2">
        <div className="order-2 lg:order-1 p-4 pb-0 lg:p-6 xl:p-10">
          <div className="h-56 lg:h-full lg:min-h-[480px]">
            <AuthImageCarousel />
          </div>
        </div>

        <div className="order-1 lg:order-2 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-12 xl:mr-24">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-10 group">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-600 text-white group-hover:bg-orange-500 transition-colors">
                <Icon icon={NavIcons.brand} size={22} />
              </span>
              <span className="text-xl font-semibold tracking-tight">TZW Fire Safety</span>
            </Link>

            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-[var(--text-muted)] mt-2 text-sm">{subtitle}</p>}

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-6 text-sm text-center lg:text-left text-[var(--text-muted)]">{footer}</div>
            )}
          </div>
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] shrink-0">
        <span>© {new Date().getFullYear()} TZW LTD</span>
        <div className="flex gap-4">
          <span className="hover:text-[var(--text-primary)] cursor-default transition-colors">Privacy Policy</span>
          <span className="hover:text-[var(--text-primary)] cursor-default transition-colors">Terms & Conditions</span>
        </div>
      </footer>
    </div>
  );
}

export function AuthSubmitButton({
  children,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={buttonClass('orange', 'lg', 'w-full py-3 rounded-xl mt-2 font-semibold disabled:hover:bg-orange-600')}
    >
      {children}
    </button>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-orange-600 hover:text-orange-500 font-medium transition-colors">
      {children}
    </Link>
  );
}
