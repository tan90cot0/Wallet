/**
 * Encryption utilities - exact copy of working Kivy Python code
 */

// Constants - exactly from Python
const SPACE_CHAR = "xxxxxxx";
const SYMBOLS = [".", ",", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "~", "`", "[", "]", "{", "}", "|", "<", ">", ":", ";", "'"];
const SHIFT_AMOUNT = 3;

/**
 * Encrypt function - exact copy of Python version
 * @param {string} text - Text to encrypt
 * @param {number} shift - Shift amount
 * @param {boolean} encr - Encryption mode
 * @returns {string} - Encrypted text
 */
export const encrypt = (text, shift, encr = true) => {
  let encrypted_text = "";
  let ind = 0;
  
  for (let char of text) {
    if (char.match(/[a-zA-Z]/)) {
      let offset = 0;
      if (encr === true) {
        offset = Math.random() < 0.5 ? 0 : 32; // random.choice([0, 32])
      }
      
      const ascii_offset = 'a'.charCodeAt(0); // ord('a')
      
      if (ind % 2 === 0) {
        shift *= -1;
      }
      
      // Convert to lowercase like Python
      const lowerChar = char.toLowerCase();
      let charCode = (lowerChar.charCodeAt(0) - ascii_offset + shift) % 26 + ascii_offset - offset;
      
      // Handle potential negative values
      if (charCode < 0) {
        charCode += 26; // Should be 26, not 256 for proper modular arithmetic
      }
      
      const encrypted_char = String.fromCharCode(charCode);
      encrypted_text += encrypted_char;
      
      // DO NOT increment ind - matching the Python code exactly
    } else if (char.match(/[0-9]/)) {
      if (encr === false) {
        encrypted_text += ((parseInt(char) * 3) % 10).toString();
      } else {
        encrypted_text += ((parseInt(char) * 7) % 10).toString();
      }
    } else if (char === '/') {
      encrypted_text += '?';
    } else if (char === '?') {
      encrypted_text += '/';
    } else {
      encrypted_text += char;
    }
  }
  
  return encrypted_text;
};

/**
 * Decrypt function - exact copy of Python version
 * @param {string} encrypted_text - Encrypted text
 * @param {number} shift - Shift amount
 * @returns {string} - Decrypted text
 */
export const decrypt = (encrypted_text, shift) => {
  // Replace all symbols with spaces - simpler approach
  for (let ch of SYMBOLS) {
    // Use split and join for safer replacement
    encrypted_text = encrypted_text.split(ch).join(' ');
  }
  
  encrypted_text = encrypted_text.toLowerCase();
  const st = encrypted_text.split(' '); // Split on single space like Python
  let res = "";
  
  for (let string of st) {
    // Only process non-empty strings (this is crucial!)
    if (string.length > 0) {
      res += encrypt(string, -shift, false) + " ";
    }
  }
  
  return res.trim(); // Remove trailing space
};

/**
 * Encrypt details function - exact copy of Python version
 * @param {string} text - Text to encrypt
 * @param {number} shift - Shift amount
 * @returns {string} - Encrypted details
 */
export const encryptDetails = (text, shift) => {
  text = text.toLowerCase();
  const st = text.split(SPACE_CHAR);
  let res = "";
  
  for (let string of st) {
    res += encrypt(string, shift) + getRandomSymbol();
  }
  
  return res;
};

/**
 * Get random symbol from SYMBOLS array
 * @returns {string} - Random symbol
 */
const getRandomSymbol = () => {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
};

/**
 * Format card number with spaces for display
 * @param {string} cardNumber - The card number to format
 * @returns {string} - Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  return cardNumber.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Get the card network based on the first digit
 * @param {string} cardNumber - The card number
 * @returns {string} - Name of the card network
 */
export const getCardNetwork = (cardNumber) => {
  const firstDigit = cardNumber[0];
  
  if (firstDigit === '4') return 'visa';
  if (firstDigit === '5') return 'mastercard';
  if (firstDigit === '6') return 'rupay';
  
  return 'other';
};

export {
  SPACE_CHAR,
  SYMBOLS,
  SHIFT_AMOUNT
};

export default {
  encrypt,
  decrypt,
  encryptDetails,
  formatCardNumber,
  getCardNetwork,
  SPACE_CHAR,
  SHIFT_AMOUNT
};