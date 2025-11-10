import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle';
};

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const textStyle = [
    styles.base,
    type === 'defaultSemiBold' && styles.semiBold,
    type === 'title' && styles.title,
    type === 'subtitle' && styles.subtitle,
    style,
  ];

  return <Text style={textStyle} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text,
    fontSize: 16,
  },
  semiBold: {
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
});

