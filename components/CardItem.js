import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SharedElement } from 'react-navigation-shared-element';

// Import utilities
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { getCardNetwork, getBankColors } from '../utils/cardUtils';

const { width } = Dimensions.get('window');

const CardItem = ({ cardData, onPress, onLongPress, style }) => {
  const { bank_name, card_number, encryption_key } = cardData;
  
  // Get bank name without the 'xxx' separators
  const cleanBankName = bank_name?.split('xxx').join(' ').trim() || bank_name;
  
  // Determine card network and get appropriate logo
  const cardNetwork = getCardNetwork(card_number);
  
  // Get gradient colors based on bank
  const getGradientColors = () => {
    return getBankColors(cleanBankName);
  };
  
  // Get bank logo based on bank name
  const getBankLogo = () => {
    const bankLower = cleanBankName.toLowerCase();
    
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

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.95}
      delayLongPress={800}
    >
      <SharedElement id={`card.${encryption_key}`}>
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardContainer}
          >
            <View style={styles.cardContent}>
              <View style={styles.leftSection}>
                <View style={styles.cardInfo}>
                  <Text style={styles.bankName} numberOfLines={1}>
                    {cleanBankName}
                  </Text>
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardNumber}>•••• •••• •••• {card_number}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.rightSection}>
                <Image source={getBankLogo()} style={styles.bankLogo} resizeMode="contain" />
                <Icon name="credit-card-chip" size={24} color="rgba(255, 255, 255, 0.8)" style={styles.chipIcon} />
              </View>
            </View>
          </LinearGradient>
          
          <View style={styles.actionIndicator}>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </View>
      </SharedElement>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 0,
    marginBottom: 16,
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    minHeight: 96,
  },
  cardContainer: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    margin: 8,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: '100%',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bankName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: theme.typography.families.bold,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNumber: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: '100%',
  },
  bankLogo: {
    width: 32,
    height: 20,
    marginBottom: 4,
  },
  chipIcon: {
    opacity: 0.7,
  },
  actionIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CardItem;