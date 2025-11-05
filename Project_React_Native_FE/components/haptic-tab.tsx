import React, { forwardRef } from 'react';
import { Pressable, View, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export const HapticTab = forwardRef<View, BottomTabBarButtonProps>(
  ({ onPress, children, accessibilityState, ...rest }, ref) => {
    const focused = accessibilityState?.selected;

    const handlePress = (event: GestureResponderEvent) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onPress) onPress(event);
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        style={{ opacity: focused ? 1 : 0.7 }}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
);

HapticTab.displayName = 'HapticTab';
