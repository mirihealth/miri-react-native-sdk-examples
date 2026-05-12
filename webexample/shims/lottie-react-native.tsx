// Lottie shim — renders a small View placeholder instead of trying to
// play an animation. The SDK uses lottie for spinners and confetti;
// on web these become silent no-ops. Real lottie-web integration is a
// future swap (lottie-web works in browsers).
import { View, type ViewStyle } from 'react-native';
import type { FC } from 'react';

interface LottieProps {
  source?: unknown;
  style?: ViewStyle | ViewStyle[];
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  progress?: number;
  resizeMode?: string;
  // Web-specific
  animationData?: unknown;
}

const LottieView: FC<LottieProps> = ({ style }) => <View style={style} />;

export default LottieView;
export { LottieView };
