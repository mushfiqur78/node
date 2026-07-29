import { ReactNode } from 'react';

/**
 * MainLayout - thin wrapper, Navbar & Footer are in root layout.tsx
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
