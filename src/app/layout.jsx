import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Navbar />
              <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {children}
              </main>
              <Footer />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
