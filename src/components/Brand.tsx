import { Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { styles } from './styles/branding.styles';
import { colors } from '@/theme/theme';

export function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark}>
        <Sparkles size={18} color={colors.primary} strokeWidth={2.5} />
      </View>
      <Text style={styles.brandText}>
        lenvocab<Text style={{ color: colors.primary }}>.</Text>
      </Text>
    </View>
  );
}
