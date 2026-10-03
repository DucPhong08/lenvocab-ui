import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContent } from '@/app/AppContent';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
