export const convertWeight = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;

  // Convert to kg first
  let inKg = fromUnit === 'lbs' ? value * 0.45359237 : value;
  
  // Then convert to target unit
  return toUnit === 'lbs' ? inKg * 2.20462262 : inKg;
};

export const convertDistance = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;

  // Convert to km first
  let inKm = fromUnit === 'miles' ? value * 1.60934 : value;
  
  // Then convert to target unit
  return toUnit === 'miles' ? inKm * 0.621371 : inKm;
};

export const formatWeight = (value, unit) => {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
};

export const formatDistance = (value, unit) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded} ${unit}`;
};

export const convertWorkoutStats = (stats, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return stats;

  return {
    ...stats,
    weight: convertWeight(stats.weight, fromUnit, toUnit),
    distance: convertDistance(stats.distance, 
      fromUnit === 'metric' ? 'km' : 'miles',
      toUnit === 'metric' ? 'km' : 'miles'
    )
  };
};
