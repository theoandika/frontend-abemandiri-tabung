import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

import { Box, StyledEngineProvider } from "@mui/material";

import BackgroundWrapper from "@/components/layout/containers/background-wrapper";
import SnackbarWrapper from "@/components/layout/containers/snackbar-wrapper";
import LayoutContextProvider from "@/components/layout/layout-context";
import Loading from "@/pages/loading";
import AppRoutes from "@/routes";
import ThemeProvider from "@/theme/theme-provider";
import UserProvider from "./hooks/use-user";
import CacheInitializer from "@/components/cache-initializer";
const App = () => {
  const { i18n } = useTranslation();
  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  return (
    <>
      <CacheInitializer />
      <BrowserRouter>
        <StyledEngineProvider enableCssLayer>
          <Box
            lang={i18n.language}
            dir={direction}
            className="font-mulish font-urbanist relative overflow-hidden antialiased"
          >
            {/* Initial loader */}
            <div id="initial-loader">
              <div className="spinner"></div>
            </div>
            {/* Initial loader end */}

            <ThemeProvider>
              <UserProvider>
                <LayoutContextProvider>
                  <BackgroundWrapper />
                  <SnackbarWrapper>
                    <Suspense fallback={<Loading />}>
                      <AppRoutes />
                    </Suspense>
                  </SnackbarWrapper>
                </LayoutContextProvider>
              </UserProvider>
            </ThemeProvider>
          </Box>
        </StyledEngineProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
