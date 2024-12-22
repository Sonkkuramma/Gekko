// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './_components/ClientLayout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from './_components/SidebarContext';
// import { CartProvider } from './_components/cart/CartContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Your App Name',
  description: 'Your app description',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
          />
        </head>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              {/* <CartProvider> */}
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
              {/* </CartProvider> */}
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
