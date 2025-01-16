export  function checkAndFormat(name) {
    // Check if the string contains a space
    if (name.includes(' ')) {
        return name
            .toLowerCase()          // Convert the entire string to lowercase
            .split(' ')             // Split the string into an array of words
            .join('_');             // Join the words back together with underscores
    } else {
        return name; // Return the string as is if it doesn't contain spaces
    }
}