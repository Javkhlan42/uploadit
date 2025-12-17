import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'YellowBook - Business Directory',
  description: 'Discover the best local businesses in your area on sharnom.systems',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
