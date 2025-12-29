import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import NoleggiLayout from "@/components/layout/NoleggiLayout";
import StoricoNoleggi from "@/pages/StoricoNoleggi";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Interventi from "./pages/Interventi";
import PreventiviAssistenza from "./pages/PreventiviAssistenza";
import GestioneInterventi from "./pages/GestioneInterventi";
import ModificaIntervento from "./pages/ModificaIntervento";
import Noleggi from "./pages/Noleggi";
import NoleggiAttivi from "./pages/NoleggiAttivi";
import Fabbisogno from "./pages/Fabbisogno";
import PreventiviNoleggio from "./pages/PreventiviNoleggio";
import TrasportiPage from "./pages/TrasportiPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/interventi" element={<Interventi />} />
                      <Route path="/preventivi-assistenza" element={<PreventiviAssistenza />} />
                      <Route path="/gestione-interventi" element={<GestioneInterventi />} />
                      <Route path="/interventi/:id/modifica" element={<ModificaIntervento />} />

                      {/* Noleggi Ecosystem */}
                      <Route path="/noleggi" element={<NoleggiLayout />}>
                        <Route index element={<Navigate to="attivi" replace />} />
                        <Route path="attivi" element={<NoleggiAttivi />} />
                        <Route path="preventivi" element={<PreventiviNoleggio />} />
                        <Route path="disponibili" element={<Noleggi />} />
                        <Route path="storico" element={<StoricoNoleggi />} />
                      </Route>

                      <Route path="/trasporti" element={<TrasportiPage />} />
                      <Route path="/fabbisogno" element={<Fabbisogno />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
