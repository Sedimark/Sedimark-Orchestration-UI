export default function formatName(name) {
    return name
        .toLowerCase()          // Convert the entire string to lowercase
        .split(' ')             // Split the string into an array of words
        .join('_');             // Join the words back together with underscores
}