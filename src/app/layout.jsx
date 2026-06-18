import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LoadingProvider } from '@/context/LoadingContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageLoader from '@/components/PageLoader';
import { ChatProvider } from '@/context/ChatContext';
import ChatWidget from '@/components/ChatWidget';

export const metadata = {
  title: 'TCUBE Fashions | Luxury Minimalist Fashion Label',
  description: 'Shop luxury clothing, shoes, and accessories. Experience ultra-modern minimal styles crafted from premium materials.',
  keywords: 'luxury fashion, minimal clothing, organic apparel, designer dress, trench coats, linen pants, premium shoes',
  authors: [{ name: 'TCUBE Fashions' }]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <LoadingProvider>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <ChatProvider>
                    <PageLoader />
                    <Navbar />
                    <main className="flex-grow max-w-[1440px] w-full mx-auto px-6 md:px-12 py-8 animate-fade-in">
                      {children}
                    </main>
                    <Footer />
                    <ChatWidget />
                  </ChatProvider>
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
