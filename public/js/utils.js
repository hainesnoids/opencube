//  Fisher-Yates shuffle
function shuffle (array) {
	var i = 0,
	    j = 0,
	    temp = null;

	for (i = array.length - 1; i > 0; i -= 1) {
		j = Math.floor(Math.random() * (i + 1));
		temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

// Array scaling with linear interpolation
function scaleArray(inputArray, targetLength) {
    if (targetLength <= 0) return []; // Return an empty array for non-positive target lengths
    if (inputArray.length === 0) return []; // Return an empty array for empty input

    const outputArray = new Array(targetLength);
    const scaleFactor = (inputArray.length - 1) / (targetLength - 1);

    for (let i = 0; i < targetLength; i++) {
        const index = i * scaleFactor;
        const lowerIndex = Math.floor(index);
        const upperIndex = Math.ceil(index);
        const weight = index - lowerIndex;

        if (upperIndex >= inputArray.length) {
            outputArray[i] = inputArray[lowerIndex]; // Handle edge case for the last element
        } else {
            outputArray[i] = inputArray[lowerIndex] * (1 - weight) + inputArray[upperIndex] * weight;
        }
    }

    return outputArray;
}