// Partner-styled section header — uppercased eyebrow above mixed
// home-screen blocks. Used to label sections that combine partner cards
// with embedded Miri components, so the patient sees consistent
// MetaPath chrome around the SDK content.

import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { partnerColors } from '../partnerTheme';

interface SectionHeaderProps {
  children: string;
  /** Optional trailing accessory (e.g. count badge, link). */
  right?: React.ReactNode;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ children, right }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{children}</Text>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: partnerColors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
