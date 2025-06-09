import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

// Components
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import VirtualCard from '../components/VirtualCard';

// Utils & API
import { getCardsFromFirebase, saveCardsToFirebase } from '../api/firebase';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import {
  formatCardNumber,
  formatExpiryDate,
  getCardNetwork,
  validateCardholderName,
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  validatePIN
} from '../utils/cardUtils';
import { encryptDetails, SHIFT_AMOUNT, SPACE_CHAR } from '../utils/encryptionUtils';

const AddCardScreen = ({ navigation }) => {
  // Form state with test data for easier testing
  const [bankName, setBankName] = useState('DBS');
  const [cardNumber, setCardNumber] = useState('4335 8788 7420 0907');
  const [cardholderName, setCardholderName] = useState('Aryan Test');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [pin, setPin] = useState('1234');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [errors, setErrors] = useState({});
  
  // Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  
  // Input refs for next-field navigation
  const cardNumberRef = useRef(null);
  const cardholderNameRef = useRef(null);
  const expiryDateRef = useRef(null);
  const cvvRef = useRef(null);
  const pinRef = useRef(null);
  
  // Handle card number input with formatting and validation
  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    
    // Clear error when user starts typing
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: null }));
    }
    
    // Real-time validation feedback
    if (formatted.replace(/\s/g, '').length >= 13) {
      const isValid = validateCardNumber(formatted);
      if (!isValid) {
        setErrors(prev => ({ ...prev, cardNumber: 'Invalid card number' }));
      }
    }
  };
  
  // Handle expiry date input with formatting
  const handleExpiryDateChange = (text) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
    
    if (errors.expiryDate) {
      setErrors(prev => ({ ...prev, expiryDate: null }));
    }
    
    // Real-time validation
    if (formatted.length === 5) {
      const isValid = validateExpiryDate(formatted);
      if (!isValid) {
        setErrors(prev => ({ ...prev, expiryDate: 'Invalid or expired date' }));
      }
    }
  };
  
  // Handle CVV input with network-specific validation
  const handleCVVChange = (text) => {
    setCvv(text);
    
    if (errors.cvv) {
      setErrors(prev => ({ ...prev, cvv: null }));
    }
    
    // Real-time validation
    if (text.length >= 3) {
      const network = getCardNetwork(cardNumber);
      const isValid = validateCVV(text, network);
      if (!isValid) {
        const expectedLength = network === 'amex' ? 4 : 3;
        setErrors(prev => ({ 
          ...prev, 
          cvv: `CVV must be ${expectedLength} digits for ${network.toUpperCase()}` 
        }));
      }
    }
  };
  
  // Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Bank name validation
    if (!bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    } else if (bankName.trim().length < 2) {
      newErrors.bankName = 'Bank name must be at least 2 characters';
    }

    // Card number validation
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Cardholder name validation
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (!validateCardholderName(cardholderName)) {
      newErrors.cardholderName = 'Invalid cardholder name';
    }
    
    // Expiry date validation
    if (!expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!validateExpiryDate(expiryDate)) {
      newErrors.expiryDate = 'Invalid or expired date';
    }
    
    // CVV validation
    if (!cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else {
      const network = getCardNetwork(cardNumber);
      if (!validateCVV(cvv, network)) {
        const expectedLength = network === 'amex' ? 4 : 3;
        newErrors.cvv = `CVV must be ${expectedLength} digits`;
      }
    }
    
    // PIN validation
    if (!pin.trim()) {
      newErrors.pin = 'PIN is required';
    } else if (!validatePIN(pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle adding a new card
  const handleAddCard = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Haptic feedback for start
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Animation - shrink card
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Create encrypted card data
      const cardholderNameFormatted = cardholderName.replace(/\s/g, '?');
      const cardNumberClean = cardNumber.replace(/\s/g, '');
      
      const originalText = 
        bankName + SPACE_CHAR + 
        cardNumberClean + SPACE_CHAR + 
        cardholderNameFormatted + SPACE_CHAR + 
        expiryDate + SPACE_CHAR + 
        cvv;
      
      const key = encryptDetails(originalText, SHIFT_AMOUNT);
      
      // Create new card object
      const newCard = {
        card_number: cardNumberClean.slice(-4),
        bank_name: bankName,
        card_pin: pin,
        encryption_key: key
      };
      
      // Match exact Kivy logic: get current app cards, add new card, save all
      const currentCards = await getCardsFromFirebase();
      currentCards[key] = newCard;
      
      // Direct Firebase save like Kivy: requests.put(url, json=json.dumps(cards))
      await saveCardsToFirebase(currentCards);
      
      // Set success state
      setEncryptionKey(key);
      
      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Success animation
      setTimeout(() => {
        setShowSuccess(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 600);
      
    } catch (error) {
      console.error('Error adding card:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to add card. Please try again.');
      
      // Reset animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form and return to wallet
  const returnToWallet = () => {
    navigation.goBack();
  };
  
  // Handle card preview data
  const getCardPreviewData = () => {
    return {
      bankName: bankName || 'BANK NAME',
      cardNumber: cardNumber || '•••• •••• •••• ••••',
      cardholderName: cardholderName || 'YOUR NAME',
      expiryDate: expiryDate || 'MM/YY',
    };
  };
  
  // Render the success screen
  const renderSuccessScreen = () => (
    <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
      <LottieView
        source={require('../assets/lottie/success-animation.json')}
        autoPlay
        loop={false}
        style={styles.successAnimation}
      />
      <Text style={styles.successTitle}>Card Added Successfully!</Text>
      <Text style={styles.successText}>
        Your card has been encrypted and stored securely in your wallet.
      </Text>
      
      <View style={styles.successButtons}>
        <CustomButton
          title="Done"
          icon="check"
          onPress={returnToWallet}
          style={styles.doneButton}
        />
      </View>
    </Animated.View>
  );
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showSuccess ? (
          renderSuccessScreen()
        ) : (
          <>
            <Text style={styles.headerText}>Add Card Details</Text>
            
            <Animated.View 
              style={[
                styles.cardPreviewContainer,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: cardOpacity
                }
              ]}
            >
              <VirtualCard cardData={getCardPreviewData()} />
            </Animated.View>
            
            <View style={styles.formContainer}>
              <CustomInput
                label="Bank Name"
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={(text) => {
                  setBankName(text);
                  if (errors.bankName) {
                    setErrors(prev => ({ ...prev, bankName: null }));
                  }
                }}
                icon="bank"
                returnKeyType="next"
                onSubmitEditing={() => cardNumberRef.current?.focus()}
                error={errors.bankName}
              />
              
              <CustomInput
                ref={cardNumberRef}
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="number-pad"
                maxLength={19}
                icon="credit-card"
                returnKeyType="next"
                onSubmitEditing={() => cardholderNameRef.current?.focus()}
                error={errors.cardNumber}
              />
              
              <CustomInput
                ref={cardholderNameRef}
                label="Cardholder Name"
                placeholder="Enter name as on card"
                value={cardholderName}
                onChangeText={(text) => {
                  setCardholderName(text);
                  if (errors.cardholderName) {
                    setErrors(prev => ({ ...prev, cardholderName: null }));
                  }
                }}
                autoCapitalize="characters"
                icon="account"
                returnKeyType="next"
                onSubmitEditing={() => expiryDateRef.current?.focus()}
                error={errors.cardholderName}
              />
              
              <View style={styles.rowContainer}>
                <CustomInput
                  ref={expiryDateRef}
                  containerStyle={styles.halfInput}
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  keyboardType="number-pad"
                  maxLength={5}
                  icon="calendar"
                  returnKeyType="next"
                  onSubmitEditing={() => cvvRef.current?.focus()}
                  error={errors.expiryDate}
                />
                
                <CustomInput
                  ref={cvvRef}
                  containerStyle={styles.halfInput}
                  label="CVV"
                  placeholder="123"
                  value={cvv}
                  onChangeText={handleCVVChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  icon="shield"
                  returnKeyType="next"
                  onSubmitEditing={() => pinRef.current?.focus()}
                  error={errors.cvv}
                />
              </View>
              
              <CustomInput
                ref={pinRef}
                label="Card PIN"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChangeText={(text) => {
                  setPin(text);
                  if (errors.pin) {
                    setErrors(prev => ({ ...prev, pin: null }));
                  }
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                icon="lock"
                returnKeyType="done"
                onSubmitEditing={handleAddCard}
                error={errors.pin}
              />
              
              <View style={styles.buttonsContainer}>
                <CustomButton
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelButton}
                  icon="close"
                  outline
                />
                <CustomButton
                  title="Add Card"
                  onPress={handleAddCard}
                  style={styles.addButton}
                  icon="check"
                  loading={loading}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  headerText: {
    fontSize: theme.typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
    fontFamily: theme.typography.families.bold,
  },
  cardPreviewContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  addButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    backgroundColor: colors.success,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  successAnimation: {
    width: 200,
    height: 200,
  },
  successTitle: {
    fontSize: theme.typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: theme.spacing.lg,
    textAlign: 'center',
    fontFamily: theme.typography.families.bold,
  },
  successText: {
    fontSize: theme.typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.typography.families.regular,
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
  },
  successButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  doneButton: {
    minWidth: 120,
    backgroundColor: colors.success,
  },
});

export default AddCardScreen;