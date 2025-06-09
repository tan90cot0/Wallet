import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

const EmptyWallet = ({ onAddCard }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="wallet-outline" size={80} color={colors.textSecondary} />
      </View>
      
      <Text style={styles.title}>No Cards in Wallet</Text>
      <Text style={styles.subtitle}>
        Add cards to Wallet for easy and secure access to your payment information.
      </Text>
      
      <TouchableOpacity style={styles.addButton} onPress={onAddCard} activeOpacity={0.8}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.buttonGradient}
        >
          <Icon name="plus" size={20} color={colors.white} />
          <Text style={styles.buttonText}>Add Card</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="shield-check-outline" size={20} color={colors.success} />
          <Text style={styles.infoText}>Secure encryption</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="eye-off-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>Privacy protected</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="cloud-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Cloud synchronized</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
    opacity: 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.families.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxxl,
    fontFamily: theme.typography.families.regular,
    lineHeight: 22,
    maxWidth: 280,
  },
  addButton: {
    marginBottom: theme.spacing.xxxl,
    borderRadius: 25,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    fontFamily: theme.typography.families.bold,
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.families.medium,
    marginLeft: theme.spacing.sm,
  },
});

export default EmptyWallet;