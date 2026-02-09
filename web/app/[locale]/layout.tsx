import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Poppins, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { isLocale } from "@/lib/i18n";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

const poppins = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "happynachbar",
  description: "Get to know your neighbors better.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  if (!isLocale(params.locale)) notFound();
  setRequestLocale(params.locale);
  const messages = await getMessages();
  return (
    <html lang={params.locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("happynachbar-theme");if(t==="light"||t==="dark"||t==="system"){document.documentElement.setAttribute("data-theme",t);}else{document.documentElement.setAttribute("data-theme","system");}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`min-h-screen bg-background text-foreground ${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
