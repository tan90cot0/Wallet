import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Vibration
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import constants
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const PinModal = ({ visible, onClose, onPinSuccess, correctPin, action = 'view' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pinDotsScale = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  
  // Reset pin when modal is shown
  useEffect(() => {
    if (visible) {
      setPin('');
      setError('');
      setShowSuccess(false);
      
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);
  
  // Handle pin input
  const handlePinDigit = (digit) => {
    if (pin.length < 4) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Animate the dot
      Animated.sequence([
        Animated.timing(pinDotsScale[pin.length], {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pinDotsScale[pin.length], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Update pin
      const newPin = pin + digit;
      setPin(newPin);
      
      // Clear error
      if (error) setError('');
      
      // Check if pin is complete (4 digits)
      if (newPin.length === 4) {
        // Delay verification to show the last dot
        setTimeout(() => {
          verifyPin(newPin);
        }, 300);
      }
    }
  };
  
  // Handle delete (backspace)
  const handleDelete = () => {
    if (pin.length > 0) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setPin(pin.slice(0, -1));
      if (error) setError('');
    }
  };
  
  // Verify PIN
  const verifyPin = (enteredPin) => {
    if (enteredPin === correctPin) {
      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show success animation
      setShowSuccess(true);
      
      // Call success callback after a short delay
      setTimeout(() => {
        onPinSuccess();
      }, 1000);
    } else {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Vibration.vibrate(400);
      
      // Set error and clear PIN
      setError('Incorrect PIN. Please try again.');
      setPin('');
      
      // Animate error
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  // Close modal with animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  // Render pin dots
  const renderPinDots = () => {
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.pinDot,
            index < pin.length && styles.pinDotFilled,
            {
              transform: [{ scale: pinDotsScale[index] }],
            },
          ]}
        />
      ));
  };
  
  // Render numpad
  const renderNumpad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'delete'];
    
    return (
      <View style={styles.numpadContainer}>
        {numbers.map((num, index) => {
          if (num === null) {
            return <View key={index} style={styles.numpadButton} />;
          }
          
          if (num === 'delete') {
            return (
              <TouchableOpacity
                key={index}
                style={styles.numpadButton}
                onPress={handleDelete}
              >
                <Icon name="backspace-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.numpadButton}
              onPress={() => handlePinDigit(num.toString())}
            >
              <Text style={styles.numpadText}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <BlurView style={styles.blur} tint="dark" intensity={95} />
          
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {showSuccess ? (
                <View style={styles.successContainer}>
                  <Icon name="check-circle" size={70} color={colors.success} />
                  <Text style={styles.successText}>PIN Verified</Text>
                </View>
              ) : (
                <>
                  <View style={styles.headerContainer}>
                    <Text style={styles.modalTitle}>
                      {action === 'delete' ? 'Enter PIN to Delete' : 'Enter PIN to View'}
                    </Text>
                    
                    <Text style={styles.modalSubtitle}>
                      {action === 'delete'
                        ? 'Confirm with your PIN to delete this card'
                        : 'Enter your PIN to access card details'}
                    </Text>
                  </View>
                  
                  <View style={styles.pinContainer}>{renderPinDots()}</View>
                  
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  
                  {renderNumpad()}
                  
                  <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Montserrat-Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  numpadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  numpadButton: {
    width: '30%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  numpadText: {
    fontSize: 24,
    color: colors.text,
    fontFamily: 'Montserrat-Medium',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'Montserrat-Medium',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    fontFamily: 'Montserrat-Bold',
  },
});

export default PinModal;