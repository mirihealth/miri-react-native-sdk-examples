// react-native-linear-gradient ships Flow syntax; not on the chat path
// so we render a passthrough View for any consumer that imports it.
import { FC, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface LinearGradientProps extends ViewProps {
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  children?: ReactNode;
}

const LinearGradient: FC<LinearGradientProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export default LinearGradient;
export { LinearGradient };
