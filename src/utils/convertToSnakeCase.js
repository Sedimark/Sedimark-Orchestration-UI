export const convertToSnakeCase = (inputString) => {
  // 1. Trim leading/trailing whitespace
  // 2. Convert the entire string to lowercase
  // 3. Replace one or more spaces with a single underscore
  return inputString
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}
