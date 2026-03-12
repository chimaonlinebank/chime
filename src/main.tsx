
  import { createRoot } from 'react-dom/client';
  import { Provider } from 'react-redux';
  import App from './app/App.tsx';
  import './styles/index.css';
  import { store } from './store';
  import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './context/ToastProvider';
import ErrorBoundary from './lib/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </Provider>
  </ErrorBoundary>
);