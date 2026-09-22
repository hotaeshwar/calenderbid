import "./globals.css";
import { ToastProvider } from "@/hooks/useToast";

export const metadata = {
  title: "BiD Calendar — Employee Task Calendar",
  description:
    "Production-ready task assignment and scheduling application for Building India Digital teams with WhatsApp task dispatching.",
  icons: {
    icon: "https://www.buildingindiadigital.com/media/bid.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Plus_Jakarta_Sans',sans-serif] bg-white text-slate-900 min-h-screen flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
