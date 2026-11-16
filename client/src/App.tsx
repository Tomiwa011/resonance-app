import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import CartDrawer from './components/cart/CartDrawer'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Listing from './pages/Listing'
import OrderConfirmation from './pages/OrderConfirmation'
import Product from './pages/Product'

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Listing />} />
          <Route path="/category/:category" element={<Listing />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

export default App
