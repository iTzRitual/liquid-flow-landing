import type { Metadata } from 'next';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Liquid Flow — synchronizacja szablonów Comarch e-Sklep. Open source, także na macOS.',
  description:
    'Hot-reload szablonów Liquid, wykrywanie konfliktów i backup w Git. Desktop, CLI i serwer MCP. Otwarta alternatywa dla Comarch Liquid Sync.',
  metadataBase: new URL('https://liquidflow.dev'),
  openGraph: {
    title: 'Liquid Flow — edytuj szablony Comarch e-Sklep lokalnie',
    description:
      'Hot-reload, konflikty pod kontrolą, Git backup. Desktop, CLI i MCP. Open source.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="scroll-smooth">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
