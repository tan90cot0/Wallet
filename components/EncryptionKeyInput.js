import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';

const EncryptionKeyInput = ({
  value,
  onChangeText,
  onPaste,
  onSubmit,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  
  // Animation values
  const animatedBorderWidth = useState(new Animated.Value(1))[0];
  const animatedScale = useState(new Animated.Value(1))[0];
  
  // Handle animation on focus/blur
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedBorderWidth, {
      toValue: 2,
      duration: 200,
      useNativeDriver: false
    }).start();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedBorderWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false
    }).start();
  };
  
  // Handle animation on press
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.98,
      friction: 5,
      tension: 300,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true
    }).start();
  };
  
  // Handle paste button press
  const handlePaste = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPaste && onPaste();
  };
  
  // Toggle key visibility
  const toggleVisibility = () => {
    setContentVisible(!contentVisible);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // Handle key submission
  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit && onSubmit();
  };
  
  // Border color based on state
  const borderColor = isFocused 
    ? colors.primary 
    : error 
      ? colors.error 
      : colors.border;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: animatedScale }],
          borderWidth: animatedBorderWidth,
          borderColor: borderColor
        }
      ]}
    >
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter encryption key"
          placeholderTextColor={colors.placeholderText}
          secureTextEntry={!contentVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
          autoCapitalize="none"
          autoCorrect={false}
          multiline={false}
          selectionColor={colors.primary}
        />
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleVisibility}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Icon
              name={contentVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handlePaste}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Icon
              name="content-paste"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, !value ? styles.submitButtonDisabled : null]}
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!value}
          >
            <Icon
              name="arrow-right"
              size={20}
              color={!value ? colors.textSecondary : colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 56,
    color: colors.text,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.lightGrey,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 15,
    fontFamily: 'Montserrat-Regular',
  },
});

export default EncryptionKeyInput;