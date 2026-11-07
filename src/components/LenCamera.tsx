import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/context/ThemeProvider';

export function LenCamera({ size = 116 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 180 170" accessible={false}>
      <Path
        d="M40 122l-8 21m97-21l13 19"
        stroke={colors.primaryEdge}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <Path
        d="M21 80L7 70m142 2l21-12"
        stroke={colors.primary}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <Rect x={58} y={13} width={47} height={24} rx={9} fill={colors.primary} />
      <Rect
        x={32}
        y={28}
        width={116}
        height={102}
        rx={29}
        fill={colors.accent}
      />
      <Rect
        x={27}
        y={24}
        width={116}
        height={99}
        rx={27}
        fill={colors.highlight}
      />
      <Rect
        x={111}
        y={38}
        width={18}
        height={9}
        rx={4.5}
        fill={colors.surface}
      />
      <Circle cx={78} cy={77} r={34} fill={colors.surface} />
      <Circle cx={78} cy={77} r={27} fill={colors.primary} />
      <Ellipse cx={68} cy={74} rx={3.5} ry={5} fill={colors.onPrimary} />
      <Ellipse cx={88} cy={74} rx={3.5} ry={5} fill={colors.onPrimary} />
      <Path
        d="M69 86q9 10 18 0"
        stroke={colors.onPrimary}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
