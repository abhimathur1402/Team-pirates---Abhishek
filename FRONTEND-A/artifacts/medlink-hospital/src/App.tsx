import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';

import Dashboard from '@/pages/dashboard';
import HospitalsList from '@/pages/hospitals';
import NewHospital from '@/pages/hospitals/new';
import HospitalDetail from '@/pages/hospitals/detail';
import InventoryOverview from '@/pages/inventory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl font-bold font-mono tracking-tight text-destructive mb-2">404</h1>
      <p className="text-xl font-medium text-foreground">Sector Not Found</p>
      <p className="text-muted-foreground mt-2">The requested control module does not exist.</p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/hospitals" component={HospitalsList} />
        <Route path="/hospitals/new" component={NewHospital} />
        <Route path="/hospitals/:id" component={HospitalDetail} />
        <Route path="/inventory" component={InventoryOverview} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
