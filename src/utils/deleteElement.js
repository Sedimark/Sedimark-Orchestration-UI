export function deleteElement(array, valoare) {
    const index = array.indexOf(valoare);
    if (index > -1) {
        array.splice(index, 1);
    }
}