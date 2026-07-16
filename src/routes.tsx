import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { leftMenuBottomItems, leftMenuItems } from "@/menu-items";
import AppLayout from "@/pages/app/layout";
import Loading from "@/pages/loading.tsx";
import NotFound from "@/pages/not-found";
import { MenuItem } from "@/types/types";
import UbahCabang from "@/pages/app/cabang/ubah";
import UbahSupplier from "@/pages/app/supplier/ubah";
import UbahMember from "@/pages/app/member/ubah";
import UbahJenisIsi from "@/pages/app/jenis-isi/ubah";
import UbahTabung from "@/pages/app/tabung/ubah";

// Statically import all possible pages for build
const modules = import.meta.glob("./pages/**/page.tsx");

// Lazy load page components
const lazyLoad = (path: string) => {
  // Handle different paths based on the route
  let key: string;
  if (path === "/") {
    key = "./pages/page.tsx";
  } else if (path.startsWith("/auth")) {
    key = `./pages/auth${path.substring(5)}/page.tsx`; // Remove "/auth"
  } else {
    key = `./pages/app${path}/page.tsx`;
  }

  const importer = modules[key];

  // If file not found fallback to 404
  if (!importer) return <Navigate to="/404" replace />;

  const Component = React.lazy(importer as () => Promise<{ default: React.ComponentType<any> }>);

  return (
    <React.Suspense fallback={<Loading />}>
      <Component />
    </React.Suspense>
  );
};

// Recursively generate routes from menu items
const generateRoutesFromMenuItems = (menuItems: MenuItem[]): React.ReactElement[] => {
  return menuItems.flatMap((item: MenuItem) => {
    const routes: React.ReactElement[] = [];

    // Add routes for children
    if (item.children && item.children.length > 0) {
      routes.push(...generateRoutesFromMenuItems(item.children));
    }

    // Skip external links
    if (item.isExternalLink) {
      return [];
    }

    if (item.href) {
      // Add route for current item
      routes.push(<Route key={item.id} path={item.href} element={lazyLoad(item.href)} />);
    }

    return routes;
  });
};

// Generate routes from both menu arrays
const mainRoutes = generateRoutesFromMenuItems(leftMenuItems);
const bottomRoutes = generateRoutesFromMenuItems(leftMenuBottomItems);

// Main Routes component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={lazyLoad("/")} />
      <Route element={<AppLayout />}>
        {mainRoutes}
        {bottomRoutes}
        <Route path="/ubah-cabang/:id" element={<UbahCabang />} />
        <Route path="/ubah-supplier/:id" element={<UbahSupplier />} />
        <Route path="/ubah-member/:id" element={<UbahMember />} />
        <Route path="/ubah-jenis-isi/:id" element={<UbahJenisIsi />} />
        <Route path="/ubah-tabung/:id" element={<UbahTabung />} />
      </Route>

      {/* 404 route */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
