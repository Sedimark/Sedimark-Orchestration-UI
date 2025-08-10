export const transformFormDataToNgsiLdAsset = (formData) =>{
    const ngsiLdAsset = {
        // 1. Core NGSI-LD attributes: id, type, and context
        id: `urn:ngsi-ld:Asset:${formData.identifier}`, // Construct ID from form's 'identifier' field
        type: "DataAsset",
       
    };

    // Helper function for creating a Property object
    // Handles null/undefined/empty string/empty array values by returning undefined
    // Converts Date objects to ISO 8601 strings
    const createProperty = (value) => {
        if (value === null || value === undefined || value === '') {
            return undefined; // Will cause the property to be skipped
        }
        if (Array.isArray(value) && value.length === 0) {
            return undefined; // Skip empty arrays
        }
        // Convert Date objects to ISO 8601 string format
        if (value instanceof Date) {
            return {
                type: "Property",
                value: value.toISOString()
            };
        }
        return {
            type: "Property",
            value: value
        };
    };

    // Helper function for creating a Relationship object
    // Assumes the participantId from the form is just the ID part (e.g., "MyParticipantId")
    const createRelationship = (participantId) => {
        if (!participantId) {
            return undefined;
        }
        return {
            type: "Relationship",
            object: `urn:ngsi-ld:Participant:${participantId}`
        };
    };

    // List of form fields that directly map to NGSI-LD Properties
    // These include both string values and Date objects (handled by createProperty)
    const directProperties = [
        "title", "description", "license", "spatial", "version",
        "endpointURL", "endpointDescription", "image", "temporal",
        "temporalResolution", "issued", "modified", "startedAtTime",
        "endedAtTime", "startDate", "endDate"
    ];

    directProperties.forEach(prop => {
        const ngsiLdProp = createProperty(formData[prop]);
        if (ngsiLdProp) {
            ngsiLdAsset[prop] = ngsiLdProp;
        }
    });

    // Map 'keyword' property (array of strings)
    if (formData.keyword && Array.isArray(formData.keyword) && formData.keyword.length > 0) {
        ngsiLdAsset.keyword = createProperty(formData.keyword);
    }

    // Map relationship properties
    const relationshipFields = ["creator", "publisher"];
    relationshipFields.forEach(prop => {
        const ngsiLdRel = createRelationship(formData[prop]);
        if (ngsiLdRel) {
            ngsiLdAsset[prop] = ngsiLdRel;
        }
    });

    // Map 'size' property (requires number conversion)
    if (formData.size !== undefined && formData.size !== null && formData.size !== '') {
        const sizeValue = parseFloat(formData.size);
        if (!isNaN(sizeValue)) {
            ngsiLdAsset.size = createProperty(sizeValue);
        } else {
            console.warn(`Invalid 'size' value received from form: '${formData.size}'. Expected a number.`);
        }
    }

    // Map 'location' GeoProperty
    // Assumes formData.geometry is a string "latitude,longitude" (e.g., "40.7128,-74.0060")
    // NGSI-LD GeoProperty coordinates are [longitude, latitude]
    if (formData.geometry) {
        try {
            const parts = String(formData.geometry).split(',').map(s => parseFloat(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const latitude = parts[0];
                const longitude = parts[1];
                ngsiLdAsset.location = {
                    type: "GeoProperty",
                    value: {
                        type: "Point",
                        coordinates: [longitude, latitude] // NGSI-LD standard: [lon, lat]
                    }
                };
            } else {
                console.warn("Could not parse 'geometry' string into valid coordinates (expected 'lat,lon'):", formData.geometry);
            }
        } catch (e) {
            console.error("Error processing 'geometry' for location:", e);
        }
    }

    return ngsiLdAsset;
}