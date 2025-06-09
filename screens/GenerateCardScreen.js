import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import components
import VirtualCard from '../components/VirtualCard';
import CustomButton from '../components/CustomButton';

// Import utilities
import { decrypt, SHIFT_AMOUNT } from '../utils/encryptionUtils';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const GenerateCardScreen = ({ route, navigation }) => {
  // Card data state
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Animation state
  const cardScale = useRef(new Animated.Value(0.5)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  
  // Generate card from encryption key (called on screen load)
  useEffect(() => {
    if (route.params?.encryptionKey) {
      generateCard(route.params.encryptionKey);
    }
  }, [route.params]);
  
  // Generate card directly from encryption key
  const generateCard = async (encryptionKey) => {
    if (!encryptionKey) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Decrypt the encryption key
      const decryptedText = decrypt(encryptionKey, SHIFT_AMOUNT);
      console.log('Decrypted text:', decryptedText);
      
      // Split exactly like Python: decrypted_text.split()
      let parts;
      try {
        // Python's split() without arguments splits on whitespace and filters empty strings
        parts = decryptedText.trim().split(/\s+/);
        console.log('Split parts:', parts);
        
        // Extract exactly like Python: bank_name, card_number, person_name, expiry_date, cvv = decrypted_text.split()
        const [bankName, cardNumber, personName, expiryDate, cvv] = parts;
        
        // Process person name exactly like Python: person_name.replace("/", " ")
        let cardholderName = personName.replace(/\//g, ' ');
        // Also replace question marks with spaces (since spaces were converted to ? during encryption)
        cardholderName = cardholderName.replace(/\?/g, ' ').trim();
        
        console.log('Successfully extracted card details:');
        console.log('Bank:', bankName);
        console.log('Card Number:', cardNumber);
        console.log('Cardholder Name:', cardholderName);
        console.log('Expiry:', expiryDate);  
        console.log('CVV:', cvv);
        
        // Set card data
        setCardData({
          bankName,
          cardNumber,
          cardholderName,
          expiryDate,
          cvv
        });
        
        // Animate card appearance
        Animated.parallel([
          Animated.spring(cardScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ]).start();
        
      } catch (error) {
        console.error('Error parsing decrypted text:', error);
        throw new Error('Invalid encryption key format');
      }
      
    } catch (error) {
      console.error('Error generating card:', error);
      setError('Invalid encryption key or format');
      Alert.alert('Error', 'Failed to generate card. Please try again later.');
      // Navigate back if there's an error
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerText}>Your Card Details</Text>
      </LinearGradient>
      
      <View style={styles.cardContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Icon name="credit-card-sync" size={60} color={colors.primary} />
            <Text style={styles.loadingText}>Loading your card...</Text>
          </View>
        ) : cardData ? (
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [{ scale: cardScale }],
                opacity: cardOpacity
              }
            ]}
          >
            <VirtualCard cardData={cardData} showCVV={true} />
          </Animated.View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="credit-card-off" size={60} color={colors.error} />
            <Text style={styles.errorText}>{error || 'Unable to display card details'}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Back to Wallet"
          onPress={() => navigation.goBack()}
          icon="chevron-left"
          style={styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 80,
    justifyContent: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    fontFamily: 'Montserrat-Bold',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Montserrat-Medium',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  backButton: {
    backgroundColor: colors.primary,
  }
});

export default GenerateCardScreen;