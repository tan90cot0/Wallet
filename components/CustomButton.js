import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';

const CustomButton = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  iconSize = 18,
  loading = false,
  disabled = false,
  outline = false,
  children
}) => {
  // Animation for press feedback
  const [scaleAnim] = React.useState(new Animated.Value(1));
  
  // Handle press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };
  
  // Button colors
  const getButtonStyle = () => {
    if (outline) {
      return [
        styles.button,
        styles.outlineButton,
        disabled && styles.disabledOutlineButton,
        style,
      ];
    }
    
    return [
      styles.button,
      disabled && styles.disabledButton,
      style,
    ];
  };
  
  // Text colors
  const getTextStyle = () => {
    if (outline) {
      return [
        styles.buttonText,
        styles.outlineButtonText,
        disabled && styles.disabledOutlineButtonText,
        textStyle,
      ];
    }
    
    return [
      styles.buttonText,
      disabled && styles.disabledButtonText,
      textStyle,
    ];
  };
  
  // Icon color
  const getIconColor = () => {
    if (outline) {
      return disabled ? colors.textSecondary : style?.backgroundColor || colors.primary;
    }
    return disabled ? colors.textSecondary : colors.white;
  };
  
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator
            color={outline ? (style?.backgroundColor || colors.primary) : colors.white}
            size="small"
          />
        ) : (
          <View style={styles.buttonContent}>
            {icon && (
              <Icon
                name={icon}
                size={iconSize}
                color={getIconColor()}
                style={styles.icon}
              />
            )}
            <Text style={getTextStyle()}>{title}</Text>
            {children}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-Bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    color: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.lightGrey,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  disabledOutlineButton: {
    borderColor: colors.lightGrey,
  },
  disabledOutlineButtonText: {
    color: colors.textSecondary,
  },
});

export default CustomButton;