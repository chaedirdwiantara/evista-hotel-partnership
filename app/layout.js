import './globals.css';

export const metadata = {
  title: 'Evista × Hotel Partners | Luxury Electric Transport',
  description: 'Premium electric vehicle services for discerning hotel guests. Experience sustainable luxury.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
