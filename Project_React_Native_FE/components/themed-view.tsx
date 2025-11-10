import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export function ThemedView({ style, ...props }: ViewProps) {
  return <View style={[styles.base, style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background,
  },
});

