import { ThemeProvider } from '@/theme/context/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContent } from '@/app/AppContent';
import { I18nProvider } from '@/i18n';

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
