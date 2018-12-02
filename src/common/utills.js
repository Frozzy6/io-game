export const MapToArray = map => Array.from(map).reduce((acc, item) => (acc.push(item[1]), acc), []);
