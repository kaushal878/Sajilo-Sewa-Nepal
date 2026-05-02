import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { Home } from "@/pages/Home";
import { ServicesPage } from "@/pages/Services";
import { ServiceDetail } from "@/pages/ServiceDetail";
import { MinistriesPage } from "@/pages/Ministries";
import { BookmarksPage } from "@/pages/Bookmarks";
import { LoginPage } from "@/pages/Login";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminServices } from "@/pages/admin/AdminServices";
import { AdminMinistries } from "@/pages/admin/AdminMinistries";
import { AdminDocuments } from "@/pages/admin/AdminDocuments";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import {
  subscribeMinistries,
  subscribeOffices,
  subscribeServices,
} from "@/lib/store";
import type { Ministry, Office, Service } from "@/types";

function Shell() {
  const { isDemo } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);

  useEffect(() => {
    const u1 = subscribeServices(setServices);
    const u2 = subscribeMinistries(setMinistries);
    const u3 = subscribeOffices(setOffices);
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6">
        <Routes>
          <Route
            path="/"
            element={<Home services={services} isDemo={isDemo} />}
          />
          <Route
            path="/services"
            element={<ServicesPage services={services} />}
          />
          <Route
            path="/services/:slug"
            element={<ServiceDetail services={services} />}
          />
          <Route
            path="/ministries"
            element={
              <MinistriesPage ministries={ministries} services={services} />
            }
          />
          <Route
            path="/bookmarks"
            element={<BookmarksPage services={services} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={
                <AdminDashboard services={services} ministries={ministries} />
              }
            />
            <Route
              path="services"
              element={
                <AdminServices
                  services={services}
                  ministries={ministries}
                  offices={offices}
                />
              }
            />
            <Route
              path="ministries"
              element={
                <AdminMinistries
                  ministries={ministries}
                  offices={offices}
                />
              }
            />
            <Route
              path="documents"
              element={<AdminDocuments services={services} />}
            />
          </Route>
          <Route
            path="*"
            element={
              <div className="mx-auto w-full max-w-md px-4">
                <div className="card p-8 text-center">
                  <h1 className="text-xl font-bold">पृष्ठ भेटिएन</h1>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    तपाईंले खोज्नुभएको पृष्ठ अस्तित्वमा छैन।
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
      <ChatBot services={services} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  );
}
