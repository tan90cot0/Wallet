// src/api/firebase.js
import axios from 'axios';

// Using the correct Firebase URL for the React Native app
const FIREBASE_URL = 'https://wallet-aa329-default-rtdb.asia-southeast1.firebasedatabase.app/.json';

/**
 * Encode key to be Firebase-safe by replacing forbidden characters
 * Firebase keys cannot contain: $ # [ ] / .
 */
const encodeFirebaseKey = (key) => {
  return key
    .replace(/\$/g, '_DOLLAR_')
    .replace(/#/g, '_HASH_')
    .replace(/\[/g, '_LBRACKET_')
    .replace(/\]/g, '_RBRACKET_')
    .replace(/\//g, '_SLASH_')
    .replace(/\./g, '_DOT_');
};

/**
 * Decode Firebase-safe key back to original
 */
const decodeFirebaseKey = (encodedKey) => {
  return encodedKey
    .replace(/_DOLLAR_/g, '$')
    .replace(/_HASH_/g, '#')
    .replace(/_LBRACKET_/g, '[')
    .replace(/_RBRACKET_/g, ']')
    .replace(/_SLASH_/g, '/')
    .replace(/_DOT_/g, '.');
};

/**
 * Convert cards object to Firebase-safe format
 */
const encodeCardsForFirebase = (cards) => {
  const encodedCards = {};
  for (const [key, card] of Object.entries(cards)) {
    const encodedKey = encodeFirebaseKey(key);
    encodedCards[encodedKey] = card;
  }
  return encodedCards;
};

/**
 * Convert Firebase cards back to original format
 */
const decodeCardsFromFirebase = (encodedCards) => {
  const cards = {};
  for (const [encodedKey, card] of Object.entries(encodedCards)) {
    const originalKey = decodeFirebaseKey(encodedKey);
    cards[originalKey] = card;
  }
  return cards;
};

/**
 * Saves cards data to Firebase
 * @param {Object} cards - Cards object to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveCardsToFirebase = async (cards) => {
  try {
    console.log('Saving cards to Firebase:', Object.keys(cards).length);
    
    // Encode cards to be Firebase-safe
    const encodedCards = encodeCardsForFirebase(cards);
    console.log('Encoded cards being sent:', JSON.stringify(encodedCards, null, 2));
    console.log('Firebase URL:', FIREBASE_URL);
    
    // Firebase Realtime Database expects raw JSON object
    // Send the object directly, not as JSON string
    const response = await axios.put(FIREBASE_URL, encodedCards);
    
    console.log('Firebase response status:', response.status);
    console.log('Firebase response data:', response.data);
    
    return response.status === 200;
  } catch (error) {
    console.error('Error saving cards to Firebase:', error);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error response headers:', error.response?.headers);
    throw new Error('Failed to save cards to Firebase');
  }
};

/**
 * Retrieves cards data from Firebase
 * @returns {Promise<Object>} - Promise resolving to cards object
 */
export const getCardsFromFirebase = async () => {
  try {
    console.log('Fetching cards from Firebase...');
    const response = await axios.get(FIREBASE_URL);
    
    if (response.data && typeof response.data === 'string') {
      const encodedCards = JSON.parse(response.data);
      const cards = decodeCardsFromFirebase(encodedCards);
      console.log('Cards fetched successfully:', Object.keys(cards).length);
      return cards;
    } else if (response.data && typeof response.data === 'object') {
      const cards = decodeCardsFromFirebase(response.data);
      console.log('Cards fetched successfully:', Object.keys(cards).length);
      return cards;
    }
    
    console.log('No cards found in Firebase');
    return {};
  } catch (error) {
    console.error('Error fetching cards from Firebase:', error);
    if (error.response?.status === 404) {
      return {}; // No data exists yet
    }
    throw new Error('Failed to fetch cards from Firebase');
  }
};

/**
 * Adds a new card to Firebase
 * @param {string} key - Encryption key (used as card ID)
 * @param {Object} cardData - Card data object
 * @param {Object} cards - Current cards object
 * @returns {Promise<boolean>} - Success status
 */
export const addCardToFirebase = async (key, cardData, cards) => {
  try {
    console.log('Adding new card to Firebase...');
    
    // Match exact Kivy logic: cards[key] = new_card then requests.put
    cards[key] = cardData;
    
    // Save back to Firebase
    const success = await saveCardsToFirebase(cards);
    
    if (success) {
      console.log('Card added successfully');
    }
    
    return success;
  } catch (error) {
    console.error('Error adding card to Firebase:', error);
    throw new Error('Failed to add card to Firebase');
  }
};

/**
 * Deletes a card from Firebase
 * @param {string} key - Encryption key of card to delete
 * @param {Object} cards - Current cards object
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCardFromFirebase = async (key, cards) => {
  try {
    console.log('Deleting card from Firebase with key:', key);
    
    // Match exact Kivy logic: del cards[key] then requests.put
    if (cards[key]) {
      delete cards[key];
      console.log('Card removed from local object, new count:', Object.keys(cards).length);
      
      const success = await saveCardsToFirebase(cards);
      
      if (success) {
        console.log('Card deleted successfully from Firebase');
        return true;
      } else {
        throw new Error('Failed to save updated cards to Firebase');
      }
    } else {
      console.warn('Card not found for deletion with key:', key);
      throw new Error('Card not found');
    }
  } catch (error) {
    console.error('Error deleting card from Firebase:', error.message || error);
    throw new Error(error.message || 'Failed to delete card from Firebase');
  }
};

/**
 * Updates an existing card in Firebase
 * @param {string} key - Encryption key of card to update
 * @param {Object} updatedCardData - Updated card data
 * @returns {Promise<boolean>} - Success status
 */
export const updateCardInFirebase = async (key, updatedCardData) => {
  try {
    console.log('Updating card in Firebase...');
    
    const existingCards = await getCardsFromFirebase();
    
    if (existingCards[key]) {
      existingCards[key] = { ...existingCards[key], ...updatedCardData };
      const success = await saveCardsToFirebase(existingCards);
      
      if (success) {
        console.log('Card updated successfully');
      }
      
      return success;
    } else {
      console.warn('Card not found for update');
      return false;
    }
  } catch (error) {
    console.error('Error updating card in Firebase:', error);
    throw new Error('Failed to update card in Firebase');
  }
};

export default {
  saveCardsToFirebase,
  getCardsFromFirebase,
  addCardToFirebase,
  deleteCardFromFirebase,
  updateCardInFirebase
};