export function formatString(input) {
    const words = input.split('_');

    const formattedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

    const result = formattedWords.join(' ');
   
    return result;
}