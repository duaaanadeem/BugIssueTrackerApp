import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'BugTracker | Issue & Project Management',
  description: 'Linear-inspired developer issue tracking workspace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0c0b14] text-[#f5f6fa] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
