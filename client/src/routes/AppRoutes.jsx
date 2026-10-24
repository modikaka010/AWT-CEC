import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ── Layouts ───────────────────────────────────────────────────────────────────
import BaseLayout    from '../layouts/BaseLayout';
import BuyerLayout   from '../layouts/BuyerLayout';
import ExpertLayout  from '../layouts/ExpertLayout';
import AdminLayout   from '../layouts/AdminLayout';

// ── Route guard ───────────────────────────────────────────────────────────────
import ProtectedRoute from './ProtectedRoute';

// ── Landing ───────────────────────────────────────────────────────────────────
import LandingPage from '../pages/landing/LandingPage';
import About       from '../pages/landing/About';
import Schemes     from '../pages/landing/Schemes';
import News        from '../pages/landing/News';
import Help        from '../pages/landing/Help';

// ── Auth ──────────────────────────────────────────────────────────────────────
import Register            from '../pages/auth/Register';
import VerifyOtp           from '../pages/auth/VerifyOtp';
import SetPassword         from '../pages/auth/SetPassword';
import PendingVerification from '../pages/auth/PendingVerification';
import Login               from '../pages/auth/Login';
import AdminLogin          from '../pages/auth/AdminLogin';
import ForgotPassword      from '../pages/auth/ForgotPassword';

// ── Farmer ────────────────────────────────────────────────────────────────────
import FarmerDashboard      from '../pages/farmer/FarmerDashboard';
import MyFarm               from '../pages/farmer/farm/MyFarm';
import FarmGate             from '../components/farmer/FarmGate';
import Crops                from '../pages/farmer/crops/Crops';
import FarmerConsultation   from '../pages/farmer/consultation/FarmerConsultation';
import MarketPrices         from '../pages/farmer/market/MarketPrices';
import WeatherAdvisory      from '../pages/farmer/weather/WeatherAdvisory';
import ExpensesTracker      from '../pages/farmer/expenses/ExpensesTracker';
import ProductsList         from '../pages/farmer/products/ProductsList';
import ProductForm          from '../pages/farmer/products/ProductForm';
import FarmerProductDetail  from '../pages/farmer/products/ProductDetail';
import IncomingOrders       from '../pages/farmer/orders/IncomingOrders';
import FarmerOrderDetail    from '../pages/farmer/orders/OrderDetail';
import FarmerOrderTracking  from '../pages/farmer/orders/OrderTracking';
import SalesAnalytics       from '../pages/farmer/SalesAnalytics';
import FarmerChat           from '../pages/farmer/chat/FarmerChat';
import FarmerNotifications  from '../pages/farmer/FarmerNotifications';
import FarmerProfile        from '../pages/farmer/FarmerProfile';
import FarmerSettings       from '../pages/farmer/FarmerSettings';

// ── Buyer ─────────────────────────────────────────────────────────────────────
import BuyerDashboard          from '../pages/buyer/BuyerDashboard';
import Marketplace             from '../pages/buyer/marketplace/Marketplace';
import ProductDetail           from '../pages/buyer/marketplace/ProductDetail';
import BuyerFarmers            from '../pages/buyer/farmers/Farmers';
import BuyerFarmerProfile      from '../pages/buyer/farmers/FarmerProfile';
import BuyerFavorites          from '../pages/buyer/BuyerFavorites';
import Cart                    from '../pages/buyer/cart/Cart';
import Checkout                from '../pages/buyer/cart/Checkout';
import MyOrders                from '../pages/buyer/orders/MyOrders';
import OrderDetail             from '../pages/buyer/orders/OrderDetail';
import OrderTracking           from '../pages/buyer/orders/OrderTracking';
import BuyerChat               from '../pages/buyer/chat/BuyerChat';
import BuyerNotifications      from '../pages/buyer/BuyerNotifications';
import BuyerProfile            from '../pages/buyer/BuyerProfile';
import BuyerSettings           from '../pages/buyer/BuyerSettings';

// ── Expert ────────────────────────────────────────────────────────────────────
import ExpertDashboard    from '../pages/expert/ExpertDashboard';
import ExpertNotifications from '../pages/expert/ExpertNotifications';
import ExpertProfile      from '../pages/expert/ExpertProfile';
import ExpertSettings     from '../pages/expert/ExpertSettings';

// Expert — Consultation Requests
import ConsultationRequests      from '../pages/expert/requests/ConsultationRequests';
import ConsultationRequestDetail from '../pages/expert/requests/ConsultationRequestDetail';

// Expert — My Consultations
import MyConsultations    from '../pages/expert/consultations/MyConsultations';
import ConsultationDetail from '../pages/expert/consultations/ConsultationDetail';

// Expert — My Farmers
import MyFarmers    from '../pages/expert/farmers/MyFarmers';
import FarmerDetails from '../pages/expert/farmers/FarmerDetails';

// Expert — Disease Cases
import DiseaseCases      from '../pages/expert/disease/DiseaseCases';
import DiseaseCaseDetail from '../pages/expert/disease/DiseaseCaseDetail';

// Expert — Crop Advice
import CropAdvice     from '../pages/expert/crop-advice/CropAdvice';
import CropAdviceForm from '../pages/expert/crop-advice/CropAdviceForm';

// Expert — Knowledge
import KnowledgeResources from '../pages/expert/knowledge/KnowledgeResources';

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminDashboard from '../pages/admin/AdminDashboard';
import Farmers        from '../pages/admin/users/Farmers';
import Buyers         from '../pages/admin/users/Buyers';
import Experts        from '../pages/admin/users/Experts';
import UserDetails    from '../pages/admin/users/UserDetails';
import ExpertRequests      from '../pages/admin/verification/ExpertRequests';
import ExpertRequestDetail from '../pages/admin/verification/ExpertRequestDetail';
import Products       from '../pages/admin/products/Products';
import ProductDetails from '../pages/admin/products/ProductDetails';
import Orders         from '../pages/admin/orders/Orders';
import OrderDetails   from '../pages/admin/orders/OrderDetails';
import Reports        from '../pages/admin/reports/Reports';
import ReportDetails  from '../pages/admin/reports/ReportDetails';
import NewsManagement    from '../pages/admin/content/NewsManagement';
import NewsForm          from '../pages/admin/content/NewsForm';
import SchemesManagement from '../pages/admin/content/SchemesManagement';
import SchemeForm        from '../pages/admin/content/SchemeForm';
import Analytics      from '../pages/admin/analytics/Analytics';
import Notifications  from '../pages/admin/Notifications';
import AdminProfile   from '../pages/admin/AdminProfile';
import AdminSettings  from '../pages/admin/AdminSettings';
import AdminAdvisories from '../pages/admin/advisories/Advisories';

// ─────────────────────────────────────────────────────────────────────────────

const AppRoutes = () => (
  <Routes>

    {/* ── Public ─────────────────────────────────────────────────────────── */}
    <Route element={<BaseLayout />}>
      <Route path="/"        element={<LandingPage />} />
      <Route path="/about"   element={<About />} />
      <Route path="/schemes" element={<Schemes />} />
      <Route path="/news"    element={<News />} />
      <Route path="/help"    element={<Help />} />
    </Route>

    {/* ── Auth ───────────────────────────────────────────────────────────── */}
    <Route path="/register"             element={<Register />} />
    <Route path="/verify-otp"           element={<VerifyOtp />} />
    <Route path="/set-password"         element={<SetPassword />} />
    <Route path="/pending-verification" element={<PendingVerification />} />
    <Route path="/login"                element={<Login />} />
    <Route path="/forgot-password"      element={<ForgotPassword />} />
    <Route path="/admin-login"          element={<AdminLogin />} />

    {/* ── Farmer ─────────────────────────────────────────────────────────── */}
    <Route
      path="/farmer/*"
      element={
        <ProtectedRoute allowedRoles={['farmer']} requireStatus="active">
          <FarmGate />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard"                element={<FarmerDashboard />} />
      <Route path="farm"                     element={<MyFarm />} />
      <Route path="crops"                    element={<Crops />} />
      <Route path="consultation"             element={<FarmerConsultation />} />
      <Route path="market-prices"            element={<MarketPrices />} />
      <Route path="weather"                  element={<WeatherAdvisory />} />
      <Route path="expenses"                 element={<ExpensesTracker />} />
      <Route path="products"                 element={<ProductsList />} />
      <Route path="products/new"             element={<ProductForm />} />
      <Route path="products/:id"             element={<FarmerProductDetail />} />
      <Route path="products/:id/edit"        element={<ProductForm />} />
      <Route path="orders"                   element={<IncomingOrders />} />
      <Route path="orders/:id"               element={<FarmerOrderDetail />} />
      <Route path="orders/:id/tracking"      element={<FarmerOrderTracking />} />
      <Route path="analytics"                element={<SalesAnalytics />} />
      <Route path="chat"                     element={<FarmerChat />} />
      <Route path="chat/:userId"             element={<FarmerChat />} />
      <Route path="notifications"            element={<FarmerNotifications />} />
      <Route path="profile"                  element={<FarmerProfile />} />
      <Route path="settings"                 element={<FarmerSettings />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    {/* ── Buyer ──────────────────────────────────────────────────────────── */}
    <Route
      path="/buyer/*"
      element={
        <ProtectedRoute allowedRoles={['buyer']} requireStatus="active">
          <BuyerLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard"              element={<BuyerDashboard />} />
      <Route path="marketplace"            element={<Marketplace />} />
      <Route path="marketplace/:id"        element={<ProductDetail />} />
      <Route path="farmers"                element={<BuyerFarmers />} />
      <Route path="farmers/:id"            element={<BuyerFarmerProfile />} />
      <Route path="favorites"              element={<BuyerFavorites />} />
      <Route path="cart"                   element={<Cart />} />
      <Route path="checkout"               element={<Checkout />} />
      <Route path="orders"                 element={<MyOrders />} />
      <Route path="orders/:id"             element={<OrderDetail />} />
      <Route path="orders/:id/tracking"    element={<OrderTracking />} />
      <Route path="chat"                   element={<BuyerChat />} />
      <Route path="chat/:userId"           element={<BuyerChat />} />
      <Route path="notifications"          element={<BuyerNotifications />} />
      <Route path="profile"                element={<BuyerProfile />} />
      <Route path="settings"               element={<BuyerSettings />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    {/* ── Expert ─────────────────────────────────────────────────────────── */}
    <Route
      path="/expert/*"
      element={
        <ProtectedRoute allowedRoles={['expert']} requireStatus="active">
          <ExpertLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard"      element={<ExpertDashboard />} />

      {/* Consultation Requests */}
      <Route path="requests"       element={<ConsultationRequests />} />
      <Route path="requests/:id"   element={<ConsultationRequestDetail />} />

      {/* My Consultations */}
      <Route path="consultations"      element={<MyConsultations />} />
      <Route path="consultations/:id"  element={<ConsultationDetail />} />

      {/* My Farmers */}
      <Route path="farmers"        element={<MyFarmers />} />
      <Route path="farmers/:id"    element={<FarmerDetails />} />

      {/* Disease Cases */}
      <Route path="disease"        element={<DiseaseCases />} />
      <Route path="disease/:id"    element={<DiseaseCaseDetail />} />

      {/* Crop Advice */}
      <Route path="crop-advice"        element={<CropAdvice />} />
      <Route path="crop-advice/new"    element={<CropAdviceForm />} />
      <Route path="crop-advice/:id"    element={<CropAdviceForm />} />

      {/* Knowledge, Notifications, Profile, Settings */}
      <Route path="knowledge"      element={<KnowledgeResources />} />
      <Route path="notifications"  element={<ExpertNotifications />} />
      <Route path="profile"        element={<ExpertProfile />} />
      <Route path="settings"       element={<ExpertSettings />} />

      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    {/* ── Admin ──────────────────────────────────────────────────────────── */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={['admin']} requireStatus="active">
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard"           element={<AdminDashboard />} />
      <Route path="users/farmers"       element={<Farmers />} />
      <Route path="users/buyers"        element={<Buyers />} />
      <Route path="users/experts"       element={<Experts />} />
      <Route path="users/:id"           element={<UserDetails />} />
      <Route path="verification/requests"     element={<ExpertRequests />} />
      <Route path="verification/requests/:id" element={<ExpertRequestDetail />} />
      <Route path="advisories"                element={<AdminAdvisories />} />
      <Route path="products"            element={<Products />} />
      <Route path="products/:id"        element={<ProductDetails />} />
      <Route path="orders"              element={<Orders />} />
      <Route path="orders/:id"          element={<OrderDetails />} />
      <Route path="reports"             element={<Reports />} />
      <Route path="reports/:id"         element={<ReportDetails />} />
      <Route path="content/news"          element={<NewsManagement />} />
      <Route path="content/news/new"      element={<NewsForm />} />
      <Route path="content/news/edit/:id" element={<NewsForm />} />
      <Route path="content/schemes"          element={<SchemesManagement />} />
      <Route path="content/schemes/new"      element={<SchemeForm />} />
      <Route path="content/schemes/edit/:id" element={<SchemeForm />} />
      <Route path="analytics"           element={<Analytics />} />
      <Route path="notifications"       element={<Notifications />} />
      <Route path="profile"             element={<AdminProfile />} />
      <Route path="settings"            element={<AdminSettings />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    {/* ── Catch-all ──────────────────────────────────────────────────────── */}
    <Route path="*" element={<Navigate to="/" replace />} />

  </Routes>
);

export default AppRoutes;
