import './globals.css';
import AuthInitializer from '@/components/AuthInitializer';

export const metadata = {
  title: 'Evista × Hotel Partners | Luxury Electric Transport',
  description: 'Premium electric vehicle services for discerning hotel guests. Experience sustainable luxury.',
  icons: {
    icon: '/images/branding/evista_icon.png',
    apple: '/images/branding/evista_icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}

