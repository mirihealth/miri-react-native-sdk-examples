// @react-native-community/blur has iOS/Android-only native impls.
// On web there's no equivalent (CSS backdrop-filter could fake it, but
// for the prototype we'd rather not invent UX). Both exports become
// passthrough Views.
import { FC, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface BlurViewProps extends ViewProps {
  blurType?: string;
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
  children?: ReactNode;
}

export const BlurView: FC<BlurViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const VibrancyView: FC<BlurViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);
