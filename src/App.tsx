import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PublicAuthProvider } from "./contexts/PublicAuthContext";
import { PageShell } from "./components/layout/PageShell";
import { AccountLayout, RequirePublicAuth } from "./components/public/AccountLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { RequireRole } from "./components/admin/RequireRole";
import { HomePage } from "./pages/HomePage";
import { AdoptPage } from "./pages/AdoptPage";
import { AdoptPetDetailPage } from "./pages/AdoptPetDetailPage";
import { RescuePage } from "./pages/RescuePage";
import { RescueTrackPage } from "./pages/RescueTrackPage";
import { ShopPage } from "./pages/ShopPage";
import { ShopProductDetailPage } from "./pages/ShopProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { DonatePage } from "./pages/DonatePage";
import { BlogPage, BlogPostPage } from "./pages/BlogPage";
import { ContactPage } from "./pages/ContactPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VolunteerApplyPage } from "./pages/VolunteerApplyPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AccountDashboardPage } from "./pages/account/AccountDashboardPage";
import { AccountAdoptionsPage } from "./pages/account/AccountAdoptionsPage";
import { AccountAdoptionDetailPage } from "./pages/account/AccountAdoptionDetailPage";
import { AccountRescueReportsPage } from "./pages/account/AccountRescueReportsPage";
import { AccountNotificationsPage } from "./pages/account/AccountNotificationsPage";
import { AccountProfilePage } from "./pages/account/AccountProfilePage";
import { AccountOrdersPage } from "./pages/account/AccountOrdersPage";
import { AccountOrderDetailPage } from "./pages/account/AccountOrderDetailPage";
import { AccountDonationsPage } from "./pages/account/AccountDonationsPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminRescuePage } from "./pages/admin/AdminRescuePage";
import { AdminPetsPage } from "./pages/admin/AdminPetsPage";
import { AdminPetDetailPage } from "./pages/admin/AdminPetDetailPage";
import { AdminAdoptionDetailPage } from "./pages/admin/AdminAdoptionDetailPage";
import { AdminOrderDetailPage } from "./pages/admin/AdminOrderDetailPage";
import { AdminKennelsPage } from "./pages/admin/AdminKennelsPage";
import { AdminAdoptionsPage } from "./pages/admin/AdminAdoptionsPage";
import { AdminDonationsPage } from "./pages/admin/AdminDonationsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminExpensesPage } from "./pages/admin/AdminExpensesPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminProductDetailPage } from "./pages/admin/AdminProductDetailPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminEmailLogsPage } from "./pages/admin/AdminEmailLogsPage";
import { AdminVolunteerSchedulePage } from "./pages/admin/AdminVolunteerSchedulePage";
import { AdminMySchedulePage } from "./pages/admin/AdminMySchedulePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminVolunteersPage } from "./pages/admin/AdminVolunteersPage";
import { AdminNotificationsPage } from "./pages/admin/AdminNotificationsPage";

function App() {
  return (
    <BrowserRouter>
      <PublicAuthProvider>
        <Routes>
          <Route element={<PageShell />}>
            <Route index element={<HomePage />} />
            <Route path="adopt" element={<AdoptPage />} />
            <Route path="adopt/:id" element={<AdoptPetDetailPage />} />
            <Route path="rescue" element={<RescuePage />} />
            <Route path="rescue/track" element={<RescueTrackPage />} />
            <Route path="rescue/track/:code" element={<RescueTrackPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="shop/:id" element={<ShopProductDetailPage />} />
            <Route path="donate" element={<DonatePage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="volunteer/apply" element={<VolunteerApplyPage />} />

            <Route element={<RequirePublicAuth />}>
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="account" element={<AccountLayout />}>
                <Route index element={<AccountDashboardPage />} />
                <Route path="adoptions" element={<AccountAdoptionsPage />} />
                <Route path="adoptions/:id" element={<AccountAdoptionDetailPage />} />
                <Route path="orders" element={<AccountOrdersPage />} />
                <Route path="orders/:id" element={<AccountOrderDetailPage />} />
                <Route path="donations" element={<AccountDonationsPage />} />
                <Route path="rescue-reports" element={<AccountRescueReportsPage />} />
                <Route path="notifications" element={<AccountNotificationsPage />} />
                <Route path="profile" element={<AccountProfilePage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="rescue" element={<AdminRescuePage />} />
              <Route path="pets" element={<AdminPetsPage />} />
              <Route path="pets/:id" element={<AdminPetDetailPage />} />
              <Route path="kennels" element={<AdminKennelsPage />} />
              <Route path="adoptions" element={<AdminAdoptionsPage />} />
              <Route path="adoptions/:id" element={<AdminAdoptionDetailPage />} />
              <Route path="my-schedule" element={<AdminMySchedulePage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route element={<RequireRole roles={["ADMIN"]} />}>
                <Route path="donations" element={<AdminDonationsPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/:id" element={<AdminProductDetailPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="expenses" element={<AdminExpensesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="volunteers" element={<AdminVolunteersPage />} />
                <Route path="volunteer-schedule" element={<AdminVolunteerSchedulePage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="email-logs" element={<AdminEmailLogsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PublicAuthProvider>
    </BrowserRouter>
  );
}

export default App;
