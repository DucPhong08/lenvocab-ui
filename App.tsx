import { ThemeProvider } from '@/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContent } from '@/app/AppContent';

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
