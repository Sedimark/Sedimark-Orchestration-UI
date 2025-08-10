// --- Helper Functions (can be placed in a separate 'utils.js' file) ---

/**
 * Creates an NGSI-LD Property object.
 * Handles null/undefined/empty string/empty array values by returning undefined.
 * Converts Date objects to ISO 8601 strings.
 * @param {any} value - The value for the Property.
 * @returns {object | undefined} An NGSI-LD Property object or undefined if value is empty.
 */
const _createProperty = (value) => {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    if (Array.isArray(value) && value.length === 0) {
        return undefined;
    }
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

/**
 * Creates an NGSI-LD Relationship object.
 * @param {string} id - The ID of the related entity (e.g., "MyParticipantId").
 * @param {string} urnPrefix - The URN prefix for the related entity type (e.g., "urn:ngsi-ld:Participant:").
 * @returns {object | undefined} An NGSI-LD Relationship object or undefined if id is empty.
 */
const _createRelationship = (id, urnPrefix) => {
    if (!id) {
        return undefined;
    }
    return {
        type: "Relationship",
        object: `${urnPrefix}${id}`
    };
};

// --- Specific Asset Transformation Functions ---

/**
 * Transforms form data into an NGSI-LD WorkflowAsset entity.
 * This function processes fields based on the provided formSchemaWorkflowAsset.
 * @param {object} formData - The data object from the FormBuilder.
 * @returns {object} The NGSI-LD WorkflowAsset entity.
 */
export function transformFormDataToNgsiLdWorkflowAsset(formData) {
    const ngsiLdWorkflowAsset = {
        id: `urn:ngsi-ld:WorkflowAsset:${formData.identifier}`, // Construct ID
        type: "WorkflowAsset", // Explicit type
        // "@context": [
        //     "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.jsonld",
        //     // Add any custom contexts relevant to your WorkflowAsset if needed.
        //     // Example: "https://your-domain.com/ngsi-ld-workflow-context.jsonld"
        // ]
    };

    // --- Properties (Direct mapping from form field to NGSI-LD Property) ---
    const propertiesToMap = [
        "title", "description", "license", "spatial", "version",
        "endpointURL", "endpointDescription", "image", "processingSteps"
    ];

    propertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]);
        if (ngsiLdProp) {
            ngsiLdWorkflowAsset[prop] = ngsiLdProp;
        }
    });

    // --- Date Properties (need conversion to ISO string) ---
    const datePropertiesToMap = [
        "issued", "modified", "startedAtTime", "endedAtTime"
    ];

    datePropertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]); // _createProperty handles Date objects
        if (ngsiLdProp) {
            ngsiLdWorkflowAsset[prop] = ngsiLdProp;
        }
    });

    // --- Keyword Property (array of strings) ---
    if (formData.keyword && Array.isArray(formData.keyword) && formData.keyword.length > 0) {
        ngsiLdWorkflowAsset.keyword = _createProperty(formData.keyword);
    }

    // --- Relationships ---
    // Mapping form field names to their expected URN prefixes
    const relationshipsToMap = {
        creator: "urn:ngsi-ld:Participant:",
        publisher: "urn:ngsi-ld:Participant:",
        wasGeneratedBy: "urn:ngsi-ld:Activity:", // Assuming it links to an Activity entity
        used: "urn:ngsi-ld:Asset:",             // Assuming it links to a general Asset entity
        relatedAsset: "urn:ngsi-ld:Asset:"      // Assuming it links to another general Asset entity
    };

    for (const formField in relationshipsToMap) {
        const urnPrefix = relationshipsToMap[formField];
        const ngsiLdRel = _createRelationship(formData[formField], urnPrefix);
        if (ngsiLdRel) {
            ngsiLdWorkflowAsset[formField] = ngsiLdRel;
        }
    }

    // --- GeoProperty (geometry to location) ---
    // Assumes formData.geometry is a string "latitude,longitude"
    if (formData.geometry) {
        try {
            const parts = String(formData.geometry).split(',').map(s => parseFloat(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const latitude = parts[0];
                const longitude = parts[1];
                ngsiLdWorkflowAsset.location = { // NGSI-LD uses 'location' for GeoProperty
                    type: "GeoProperty",
                    value: {
                        type: "Point",
                        coordinates: [longitude, latitude] // NGSI-LD standard: [lon, lat]
                    }
                };
            } else {
                console.warn("Could not parse 'geometry' string for WorkflowAsset into valid coordinates (expected 'lat,lon'):", formData.geometry);
            }
        } catch (e) {
            console.error("Error processing 'geometry' for WorkflowAsset location:", e);
        }
    }

    return ngsiLdWorkflowAsset;
}

// --- You would also have the DataAsset and AIModelAsset transformations here ---
// (from previous responses, for a complete set of functions)
// export function transformFormDataToNgsiLdDataAsset(...) { ... }
// export function transformFormDataToNgsiLdAIModelAsset(...) { ... }