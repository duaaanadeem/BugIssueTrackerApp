import Providers from "../components/Providers";
import "./globals.css";

export const metadata = {
  title: "Bug & Issue Tracker",
  description:
    "Professional web client for the Bug & Issue Tracker. Uses the same backend API as the mobile app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
