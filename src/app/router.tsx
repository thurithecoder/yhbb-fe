import * as React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import RestaurantLayout from '@/layouts/RestaurantLayout';

// Pages
import HomePage from '@/features/restaurants/pages/HomePage';
import RestaurantListPage from '@/features/restaurants/pages/RestaurantListPage';
import FoodRestaurantsPage from '@/features/restaurants/pages/FoodRestaurantsPage';
import RestaurantDetailsPage from '@/features/restaurants/pages/RestaurantDetailsPage';
import FavoritesPage from '@/features/restaurants/pages/FavoritesPage';
import BlogPage from '@/features/blog/pages/BlogPage';
import ContactPage from '@/features/contact/pages/ContactPage';
import DashboardPage from '@/features/auth/pages/DashboardPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';
import VouchersPage from '@/features/auth/pages/VouchersPage';
import AdminOverviewPage from '@/features/admin/pages/AdminOverviewPage';
import AdminProfilePage from '@/features/admin/pages/AdminProfilePage';
import AdminCatalogPage from '@/features/admin/pages/AdminCatalogPage';
import AdminMenuRequestsPage from '@/features/admin/pages/AdminMenuRequestsPage';
import AdminCampaignRequestsPage from '@/features/admin/pages/AdminCampaignRequestsPage';
import AdminPromotionsPage from '@/features/admin/pages/AdminPromotionsPage';
import RestaurantOverviewPage from '@/features/restaurants/pages/RestaurantOverviewPage';
import RestaurantProfilePage from '@/features/restaurants/pages/RestaurantProfilePage';
import RestaurantPromotionsPage from '@/features/restaurants/pages/RestaurantPromotionsPage';
import RestaurantMenuRequestsPage from '@/features/restaurants/pages/RestaurantMenuRequestsPage';
import RestaurantMarketingRequestsPage from '@/features/restaurants/pages/RestaurantMarketingRequestsPage';
import RestaurantVerificationPage from '@/features/restaurants/pages/RestaurantVerificationPage';
import RestaurantPromotionScannerPage from '@/features/restaurants/pages/RestaurantPromotionScannerPage';
import RestaurantPromotionTrackingPage from '@/features/restaurants/pages/RestaurantPromotionTrackingPage';
import AdminVerificationApplicationsPage from '@/features/admin/pages/AdminVerificationApplicationsPage';
import AdminRestaurantsPage from '@/features/admin/pages/AdminRestaurantsPage';
import AdminRestaurantDetailPage from '@/features/admin/pages/AdminRestaurantDetailPage';
import RestaurantImagesManagementPage from '@/features/restaurants/pages/RestaurantImagesManagementPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'restaurants', element: <RestaurantListPage /> },
      { path: 'restaurants/food', element: <FoodRestaurantsPage /> },
      { path: 'restaurant/:id', element: <RestaurantDetailsPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'vouchers', element: <VouchersPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'profile', element: <AdminProfilePage /> },
      { index: true, element: <AdminOverviewPage /> },
      { path: 'catalog', element: <AdminCatalogPage /> },
      { path: 'menu-requests', element: <AdminMenuRequestsPage /> },
      { path: 'campaign-requests', element: <AdminCampaignRequestsPage /> },
      { path: 'promotions', element: <AdminPromotionsPage /> },
      { path: 'restaurants', element: <AdminRestaurantsPage /> },
      { path: 'restaurants/:id', element: <AdminRestaurantDetailPage /> },
      { path: 'verification-applications', element: <AdminVerificationApplicationsPage /> },
    ],
  },
  {
    path: '/restaurant-panel',
    element: <RestaurantLayout />,
    children: [
      { index: true, element: <RestaurantOverviewPage /> },
      { path: 'profile', element: <RestaurantProfilePage /> },
      { path: 'promotions', element: <RestaurantPromotionsPage /> },
      { path: 'promotions/scanner', element: <RestaurantPromotionScannerPage /> },
      { path: 'promotions/tracking', element: <RestaurantPromotionTrackingPage /> },
      { path: 'menu-requests', element: <RestaurantMenuRequestsPage /> },
      { path: 'campaign-requests', element: <RestaurantMarketingRequestsPage /> },
      { path: 'verification', element: <RestaurantVerificationPage /> },
      { path: 'images', element: <RestaurantImagesManagementPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
