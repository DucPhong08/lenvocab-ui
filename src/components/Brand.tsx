import { Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useStyles } from './styles/branding.styles';

export function Brand() {
  const { styles, colors } = useStyles();
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark}>
        <Camera size={20} color={colors.primaryText} strokeWidth={2.5} />
      </View>
      <Text style={styles.brandText}>
        lenvocab<Text style={{ color: colors.primaryText }}>.</Text>
      </Text>
    </View>
  );
}
