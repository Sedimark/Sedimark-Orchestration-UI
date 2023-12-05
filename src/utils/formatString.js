export function formatString(input) {
    // Split the input string by underscore
    const words = input.split('_');
  
    // Capitalize the first letter of each word
    const formattedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  
    // Join the formatted words with a space
    const result = formattedWords.join(' ');
  
    return result;
}