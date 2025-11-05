// components/ui/Input.tsx
import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';

interface InputProps extends TextInputProps {
  containerStyle?: object;
}

export const Input = ({ placeholder, value, onChangeText, containerStyle, ...props }: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});