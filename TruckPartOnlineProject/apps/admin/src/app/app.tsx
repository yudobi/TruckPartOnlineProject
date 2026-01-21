import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth';
import { AppRoutes } from '@/routes';
import { queryClient } from '@/lib/query-client';



function App() {
  return (
    <div className="w-full h-full bg-background text-foreground">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
              <AppRoutes />
          </Router>
        </AuthProvider>
        <Toaster />
      </QueryClientProvider>
    </div>
  );
}

export default App;