export const validateNgsiLdString = (jsonString) => {
  try {
    // First, try to parse the string into an object
    const asset = JSON.parse(jsonString);

    // Basic NGSI-LD structure validation
    if (!asset.id || !asset.type) {
      throw new Error('Missing required fields: id or type');
    }

    // Validate ID format
    if (!asset.id.startsWith('urn:ngsi-ld:')) {
      throw new Error('Invalid ID format: must start with urn:ngsi-ld:');
    }

    // Validate each property in the asset
    for (const [key, value] of Object.entries(asset)) {
      // Skip id and type as they're already validated
      if (key === 'id' || key === 'type') continue;

      // Check if it's a valid NGSI-LD property or relationship
      if (!value || typeof value !== 'object') {
        throw new Error(`Invalid property structure for ${key}: must be an object`);
      }

      // Validate property structure
      if (value.type === 'Property') {
        if (!('value' in value)) {
          throw new Error(`Missing value in Property: ${key}`);
        }
      } else if (value.type === 'Relationship') {
        if (!('object' in value)) {
          throw new Error(`Missing object in Relationship: ${key}`);
        }
        if (!value.object.startsWith('urn:ngsi-ld:')) {
          throw new Error(`Invalid Relationship object format in ${key}`);
        }
      } else if (value.type === 'GeoProperty') {
        if (!value.value || !value.value.type || !value.value.coordinates) {
          throw new Error(`Invalid GeoProperty structure in ${key}`);
        }
      } else {
        throw new Error(`Invalid type for ${key}: ${value.type}`);
      }
    }

    return { isValid: true, asset };
  } catch (error) {
    return { 
      isValid: false, 
      error: error.message,
      details: `Validation failed: ${error.message}`
    };
  }
};