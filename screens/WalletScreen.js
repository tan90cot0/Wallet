import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import components
import CardItem from '../components/CardItem';
import EmptyWallet from '../components/EmptyWallet';
import PinModal from '../components/PinModal';

// Import utilities
import { getCardsFromFirebase, saveCardsToFirebase } from '../api/firebase';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { cardsCache } from '../utils/storageUtils';

const { width } = Dimensions.get('window');

const WalletScreen = ({ navigation }) => {
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [pinAction, setPinAction] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingFromCache, setLoadingFromCache] = useState(false);
  
  const isFocused = useIsFocused();
  const scrollY = new Animated.Value(0);
  
  // Animation values for modern header collapse
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [120, 80],
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp'
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });
  
  // Load cards with caching and error handling
  const loadCards = useCallback(async (useCache = true) => {
    try {
      setError(null);
      
      // Try to load from cache first for faster UI
      if (useCache && !refreshing) {
        setLoadingFromCache(true);
        const isValidCache = await cardsCache.isValid();
        
        if (isValidCache) {
          const cachedCards = await cardsCache.load();
          if (Object.keys(cachedCards).length > 0) {
            setCards(cachedCards);
            setLoadingFromCache(false);
            setLoading(false);
            return; // Use cached data
          }
        }
        setLoadingFromCache(false);
      }

      setLoading(true);
      
      // Fetch from Firebase
      const cardsData = await getCardsFromFirebase();
      const validCards = cardsData || {};
      
      setCards(validCards);
      
      // Cache the data
      await cardsCache.save(validCards);
      
      console.log(`Loaded ${Object.keys(validCards).length} cards successfully`);
    } catch (error) {
      console.error('Error loading cards:', error);
      setError(error.message || 'Failed to load cards');
      
      // Try to load from cache as fallback
      if (!refreshing) {
        try {
          const fallbackCards = await cardsCache.load();
          if (Object.keys(fallbackCards).length > 0) {
            setCards(fallbackCards);
            setError('Using offline data. Please check your connection.');
          }
        } catch (cacheError) {
          console.error('Cache fallback failed:', cacheError);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingFromCache(false);
    }
  }, [refreshing]);
  
  useEffect(() => {
    if (isFocused) {
      loadCards();
    }
  }, [isFocused, loadCards]);
  
  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadCards(false); // Force fresh data
  }, [loadCards]);
  
  const handleCardPress = useCallback((card) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCard(card);
    setPinModalVisible(true);
    setPinAction('view');
  }, []);
  
  const handleCardLongPress = useCallback((card) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete the ${card.bank_name} card ending in ${card.card_number}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSelectedCard(card);
            setPinModalVisible(true);
            setPinAction('delete');
          },
        },
      ]
    );
  }, []);
  
  const handlePinSuccess = async () => {
    try {
      if (pinAction === 'delete' && selectedCard) {
        // Match exact Kivy logic: del cards[key] then requests.put(url, json=json.dumps(cards))
        const currentCards = { ...cards };
        delete currentCards[selectedCard.encryption_key];
        
        // Direct Firebase save like Kivy
        await saveCardsToFirebase(currentCards);
        
        // Update local state
        setCards(currentCards);
        
        // Update cache
        await cardsCache.save(currentCards);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Card deleted successfully');
        
      } else if (pinAction === 'view' && selectedCard) {
        navigation.navigate('GenerateCard', { 
          encryptionKey: selectedCard.encryption_key,
          autoGenerate: true
        });
      }
    } catch (error) {
      console.error('Error processing card action:', error);
      Alert.alert('Error', error.message || 'Failed to process request');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setPinModalVisible(false);
      setSelectedCard(null);
    }
  };
  
  const renderCardItem = ({ item, index }) => {
    const cardData = cards[item];
    if (!cardData) return null;
    
    return (
      <CardItem 
        cardData={cardData}
        onPress={() => handleCardPress(cardData)}
        onLongPress={() => handleCardLongPress(cardData)}
      />
    );
  };
  
  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.gradientHeader}
      >
        <Animated.View 
          style={[
            styles.headerContent, 
            { opacity: headerOpacity }
          ]}
        >
          <Animated.Text 
            style={[
              styles.headerTitle, 
              { transform: [{ scale: titleScale }] }
            ]}
          >
            Wallet
          </Animated.Text>
          {loadingFromCache && (
            <View style={styles.cacheIndicator}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={styles.cacheText}>Syncing...</Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
  
  const renderEmptyState = () => {
    if (loading && !refreshing && !loadingFromCache) {
      return (
        <View style={styles.loadingContainer}>
          <LottieView 
            source={require('../assets/lottie/card-animation.json')} 
            autoPlay 
            loop
            style={styles.lottieLoading} 
          />
          <Text style={styles.loadingText}>Loading your cards...</Text>
          {error && (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => loadCards(false)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return <EmptyWallet onAddCard={() => navigation.navigate('AddCard')} />;
  };
  
  const renderFloatingActionButton = () => (
    <TouchableOpacity 
      style={styles.fabContainer}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('AddCard');
      }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.fab}
      >
        <Icon name="plus" size={24} color={colors.white} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {Object.keys(cards).length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <Animated.FlatList
            data={Object.keys(cards)}
            keyExtractor={(item) => item}
            renderItem={renderCardItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor={colors.white}
              />
            }
            removeClippedSubviews={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={21}
            getItemLayout={(data, index) => ({
              length: 108, // Approximate height of each card item
              offset: 108 * index,
              index,
            })}
          />
          
          {error && (
            <View style={styles.errorBanner}>
              <Icon name="wifi-off" size={16} color={colors.warning} />
              <Text style={styles.errorBannerText}>Offline mode</Text>
            </View>
          )}
        </>
      )}
      
      {renderFloatingActionButton()}
      
      <PinModal
        visible={isPinModalVisible}
        onClose={() => setPinModalVisible(false)}
        onPinSuccess={handlePinSuccess}
        correctPin={selectedCard?.card_pin}
        action={pinAction}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    width: '100%',
    backgroundColor: colors.background,
  },
  gradientHeader: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  headerContent: {
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    fontFamily: theme.typography.families.bold,
  },
  cacheIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  cacheText: {
    color: colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    marginLeft: theme.spacing.xs,
    fontFamily: theme.typography.families.medium,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 120,
    flexGrow: 1,
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: colors.warning + '20',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBannerText: {
    color: colors.warning,
    fontSize: theme.typography.sizes.sm,
    marginLeft: theme.spacing.xs,
    fontFamily: theme.typography.families.medium,
  },
  fabContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
  lottieLoading: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.sizes.lg,
    color: colors.textSecondary,
    fontFamily: theme.typography.families.medium,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: colors.white,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.families.bold,
  },
});

export default WalletScreen;