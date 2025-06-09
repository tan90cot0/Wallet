import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

// Import utilities
import { formatCardNumber, getCardNetwork, getBankColors } from '../utils/cardUtils';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.62;

const VirtualCard = ({ cardData, showCVV = true, style }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateAnimation] = useState(new Animated.Value(0));
  
  const { bankName, cardNumber, cardholderName, expiryDate, cvv } = cardData || {
    bankName: 'BANK NAME',
    cardNumber: '•••• •••• •••• ••••',
    cardholderName: 'YOUR NAME',
    expiryDate: 'MM/YY',
    cvv: '•••'
  };
  
  // Format card number with spaces
  const formattedCardNumber = cardNumber ? formatCardNumber(cardNumber) : cardNumber;
  
  // Determine card network based on first digit
  const cardNetwork = getCardNetwork(cardNumber || '4'); // Default to Visa if no number
  
  // Handle card flip
  const handleFlip = () => {
    if (!showCVV) return; // Don't flip if CVV shouldn't be shown
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.timing(rotateAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true
    }).start();
    
    // Delay the state change to sync with animation
    setTimeout(() => {
      setIsFlipped(!isFlipped);
    }, 300);
  };
  
  // Calculate animations for 3D rotation
  const frontInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  const backInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  });
  
  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }]
  };
  
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }]
  };
  
  // Determine gradient colors based on bank name
  const getGradientColors = () => {
    return getBankColors(bankName);
  };
  
  // Get bank logo based on bank name
  const getBankLogo = () => {
    const bankLower = bankName.toLowerCase();
    
    if (bankLower.includes('sbi')) {
      return require('../assets/images/sbi_card.png');
    } else if (bankLower.includes('hdfc')) {
      return require('../assets/images/hdfc_card.png');
    } else if (bankLower.includes('icici')) {
      return require('../assets/images/icici_card.png');
    } else if (bankLower.includes('dbs')) {
      return require('../assets/images/dbs_card.png');
    } else {
      return require('../assets/images/other_card.png');
    }
  };
  
  // Get network logo based on card network
  const getNetworkLogo = () => {
    switch (cardNetwork) {
      case 'visa':
        return require('../assets/images/visa.png');
      case 'mastercard':
        return require('../assets/images/mastercard.png');
      case 'rupay':
        return require('../assets/images/rupay.png');
      default:
        return require('../assets/images/other_card.png');
    }
  };
  
  // Render card front
  const renderCardFront = () => (
    <Animated.View style={[styles.cardSide, frontAnimatedStyle, {
      opacity: isFlipped ? 0 : 1,
      zIndex: isFlipped ? 0 : 1
    }]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardFront}
      >
        <View style={styles.cardContent}>
          <View style={styles.topRow}>
            <Image source={getBankLogo()} style={styles.bankLogo} resizeMode="contain" />
            <Image source={getNetworkLogo()} style={styles.networkLogo} resizeMode="contain" />
          </View>
          
          <View style={styles.chipRow}>
            <Icon name="credit-card-chip" size={32} color={colors.chipColor} />
            <Icon name="nfc" size={20} color={colors.white} style={styles.contactlessIcon} />
          </View>
          
          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardNumber}>{formattedCardNumber}</Text>
          </View>
          
          <View style={styles.cardholderRow}>
            <View style={styles.cardholderInfo}>
              <Text style={styles.cardholderLabel}>CARD HOLDER</Text>
              <Text style={styles.cardholderName} numberOfLines={1} ellipsizeMode="tail">
                {cardholderName && cardholderName.trim() ? cardholderName.toUpperCase() : 'YOUR NAME'}
              </Text>
            </View>
            <View style={styles.expiryInfo}>
              <Text style={styles.expiryLabel}>VALID THRU</Text>
              <Text style={styles.expiryDate}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
  
  // Render card back
  const renderCardBack = () => (
    <Animated.View style={[styles.cardSide, backAnimatedStyle, {
      opacity: isFlipped ? 1 : 0,
      zIndex: isFlipped ? 1 : 0
    }]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBack}
      >
        <View style={styles.magneticStrip} />
        
        <View style={styles.cvvContainer}>
          <View style={styles.cvvLabelRow}>
            <Text style={styles.cvvLabel}>CVV</Text>
          </View>
          <View style={styles.cvvValueContainer}>
            <Text style={styles.cvvValue}>{cvv}</Text>
          </View>
        </View>
        
        <View style={styles.backBottomSection}>
          <Image source={getNetworkLogo()} style={styles.backNetworkLogo} resizeMode="contain" />
          <Text style={styles.securityText}>
            This card is subject to the terms and conditions under which it was issued.
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableWithoutFeedback onPress={handleFlip} disabled={!showCVV}>
        <View style={styles.cardContainer}>
          {renderCardFront()}
          {renderCardBack()}
        </View>
      </TouchableWithoutFeedback>
      
      {showCVV && (
        <View style={styles.tapHintContainer}>
          <Text style={styles.tapHint}>
            {isFlipped ? 'Tap to view front' : 'Tap to view CVV'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardBack: {
    flex: 1,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bankLogo: {
    width: 65,
    height: 32,
  },
  networkLogo: {
    width: 50,
    height: 32,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  contactlessIcon: {
    opacity: 0.9,
  },
  cardNumberContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  cardholderInfo: {
    flex: 1,
    marginRight: 20,
  },
  cardholderLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.typography.families.medium,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardholderName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    fontFamily: theme.typography.families.bold,
    lineHeight: 16,
  },
  expiryInfo: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.typography.families.medium,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    fontFamily: theme.typography.families.bold,
  },
  magneticStrip: {
    width: '100%',
    height: 45,
    backgroundColor: colors.black,
    marginTop: 20,
  },
  cvvContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cvvLabelRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  cvvLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.typography.families.medium,
    letterSpacing: 0.5,
  },
  cvvValueContainer: {
    backgroundColor: colors.white,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-end',
    minWidth: 50,
  },
  cvvValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    letterSpacing: 1,
  },
  backBottomSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  backNetworkLogo: {
    width: 40,
    height: 25,
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: theme.typography.families.regular,
    lineHeight: 12,
  },
  tapHintContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
  },
  tapHint: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    fontFamily: theme.typography.families.medium,
  },
});

export default VirtualCard;