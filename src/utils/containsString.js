/**
 * Checks if a main string contains a specified substring.
 *
 * @param {string} mainString - The string to search within.
 * @param {string} subString - The string to search for.
 * @returns {boolean} True if the mainString contains the subString, false otherwise.
 */

export function containsString(mainString, subString) {
  // The includes() method returns true if the searchString is found anywhere within the string,
  // otherwise, it returns false. It is case-sensitive by default.
  return mainString.includes(subString);
}
