import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { DevProvider } from "@/components/devtools/DevContext";
import { DevBanner } from "@/components/devtools/DevBanner";
import { DevToolbar } from "@/components/devtools/DevToolbar";
import { SyncListener } from "@/components/SyncListener";




export const metadata: Metadata = {
  title: "ForexMate - Premium Foreign Exchange & International Remittance",
  description: "Live Interbank Rates & Same Day Delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '000000000000-dummyforexmateclientid.apps.googleusercontent.com'}>
          <QueryProvider>
            <AuthProvider>
              <SyncListener />
              <DevProvider>
                <DevBanner />
                {children}
                <DevToolbar />
                <Toaster richColors position="top-right" />
              </DevProvider>
            </AuthProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

