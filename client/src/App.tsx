import { Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import CartDrawer from './components/cart/CartDrawer'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Listing from './pages/Listing'
import OrderConfirmation from './pages/OrderConfirmation'
import Product from './pages/Product'

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
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
