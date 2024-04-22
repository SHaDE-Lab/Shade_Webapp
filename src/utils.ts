const convertToFahrenheit = (celsius: number): number => {
    return celsius * 1.8 + 32;
};

const convertToFeet = (meters: number): number => {
    return meters * 3.28084;
}

export { convertToFahrenheit, convertToFeet };