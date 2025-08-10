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
 * Transforms form data into an NGSI-LD AIModelAsset entity.
 * This function processes fields based on the provided AIModelAsset schema.
 * @param {object} formData - The data object from the FormBuilder.
 * @returns {object} The NGSI-LD AIModelAsset entity.
 */
export function transformFormDataToNgsiLdAIModelAsset(formData) {
    const ngsiLdAIModelAsset = {
        id: `urn:ngsi-ld:AIModelAsset:${formData.identifier}`, // Construct ID
        type: "AIModelAsset", // Explicit type
        // "@context": [
        //     "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.jsonld",
        //     // Add any custom contexts relevant to your AIModelAsset if needed.
        //     // Example: "https://your-domain.com/ngsi-ld-ai-model-context.jsonld"
        // ]
    };

    // --- Properties (Direct mapping from form field to NGSI-LD Property) ---
    const propertiesToMap = [
        "title", "description", "license", "spatial", "version", // Note: 'version' is listed twice in your schema, handled here once.
        "endpointURL", "endpointDescription", "image", "processingSteps",
        "category", "purpose", "algorithm", "serialization", "execution",
        "handleStream", "inputFormat", "inputParameters", "outputFormat",
        "outputParameters"
    ];

    propertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]);
        if (ngsiLdProp) {
            ngsiLdAIModelAsset[prop] = ngsiLdProp;
        }
    });

    // --- Date Properties (need conversion to ISO string) ---
    const datePropertiesToMap = [
        "issued", "modified", // Note: 'modified' is listed twice in your schema, handled here once.
        "startedAtTime", "endedAtTime"
    ];

    datePropertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]); // _createProperty handles Date objects
        if (ngsiLdProp) {
            ngsiLdAIModelAsset[prop] = ngsiLdProp;
        }
    });

    // --- Keyword Property (array of strings) ---
    if (formData.keyword && Array.isArray(formData.keyword) && formData.keyword.length > 0) {
        ngsiLdAIModelAsset.keyword = _createProperty(formData.keyword);
    }

    // --- Size Property (string to number conversion) ---
    if (formData.size !== undefined && formData.size !== null && formData.size !== '') {
        const sizeValue = parseFloat(formData.size);
        if (!isNaN(sizeValue)) {
            ngsiLdAIModelAsset.size = _createProperty(sizeValue);
        } else {
            console.warn(`Invalid 'size' value received for AIModelAsset: '${formData.size}'. Expected a number.`);
        }
    }

    // --- Relationships ---
    // Mapping form field names to their expected URN prefixes
    const relationshipsToMap = {
        creator: "urn:ngsi-ld:Participant:",
        publisher: "urn:ngsi-ld:Participant:",
        wasGeneratedBy: "urn:ngsi-ld:Activity:", // Assuming Activity
        used: "urn:ngsi-ld:Asset:",             // Assuming general Asset
        relatedAsset: "urn:ngsi-ld:Asset:",     // Assuming general Asset
        hasTrainingDataset: "urn:ngsi-ld:Asset:", // Assuming a Dataset Asset
        hasArchitecture: "urn:ngsi-ld:Asset:",    // Assuming an Architecture Asset
        hasDatasetProcessing: "urn:ngsi-ld:Asset:" // Assuming a Dataset Processing Asset
    };

    for (const formField in relationshipsToMap) {
        const urnPrefix = relationshipsToMap[formField];
        const ngsiLdRel = _createRelationship(formData[formField], urnPrefix);
        if (ngsiLdRel) {
            ngsiLdAIModelAsset[formField] = ngsiLdRel;
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
                ngsiLdAIModelAsset.location = { // NGSI-LD uses 'location' for GeoProperty
                    type: "GeoProperty",
                    value: {
                        type: "Point",
                        coordinates: [longitude, latitude] // NGSI-LD standard: [lon, lat]
                    }
                };
            } else {
                console.warn("Could not parse 'geometry' string for AIModelAsset into valid coordinates (expected 'lat,lon'):", formData.geometry);
            }
        } catch (e) {
            console.error("Error processing 'geometry' for AIModelAsset location:", e);
        }
    }

    return ngsiLdAIModelAsset;
}

// --- You would still need the WorkflowAsset transformation if you plan to use it ---
// (Copied from previous response for completeness, assuming its fields are also fixed)
export function transformFormDataToNgsiLdWorkflowAsset(formData) {
    const ngsiLdWorkflowAsset = {
        id: `urn:ngsi-ld:WorkflowAsset:${formData.identifier}`,
        type: "WorkflowAsset",
        "@context": [
            "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.jsonld",
        ]
    };

    const propertiesToMap = [
        "title", "description", "license", "spatial", "version",
        "endpointURL", "endpointDescription", "image", "processingSteps",
        "temporal", "temporalResolution", "startDate", "endDate" // Assuming these are part of Workflow too
    ];
    propertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]);
        if (ngsiLdProp) {
            ngsiLdWorkflowAsset[prop] = ngsiLdProp;
        }
    });

    const datePropertiesToMap = [
        "issued", "modified", "startedAtTime", "endedAtTime"
    ];
    datePropertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]);
        if (ngsiLdProp) {
            ngsiLdWorkflowAsset[prop] = ngsiLdProp;
        }
    });

    if (formData.keyword && Array.isArray(formData.keyword) && formData.keyword.length > 0) {
        ngsiLdWorkflowAsset.keyword = _createProperty(formData.keyword);
    }

    if (formData.size !== undefined && formData.size !== null && formData.size !== '') {
        const sizeValue = parseFloat(formData.size);
        if (!isNaN(sizeValue)) {
            ngsiLdWorkflowAsset.size = _createProperty(sizeValue);
        } else {
            console.warn(`Invalid 'size' value received for WorkflowAsset: '${formData.size}'. Expected a number.`);
        }
    }

    const relationshipsToMap = {
        creator: "urn:ngsi-ld:Participant:",
        publisher: "urn:ngsi-ld:Participant:",
        wasGeneratedBy: "urn:ngsi-ld:Activity:",
        used: "urn:ngsi-ld:Asset:",
        relatedAsset: "urn:ngsi-ld:Asset:"
    };

    for (const formField in relationshipsToMap) {
        const urnPrefix = relationshipsToMap[formField];
        const ngsiLdRel = _createRelationship(formData[formField], urnPrefix);
        if (ngsiLdRel) {
            ngsiLdWorkflowAsset[formField] = ngsiLdRel;
        }
    }

    if (formData.geometry) {
        try {
            const parts = String(formData.geometry).split(',').map(s => parseFloat(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const latitude = parts[0];
                const longitude = parts[1];
                ngsiLdWorkflowAsset.location = {
                    type: "GeoProperty",
                    value: {
                        type: "Point",
                        coordinates: [longitude, latitude]
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

// --- And the original DataAsset transformation ---
export function transformFormDataToNgsiLdDataAsset(formData) {
    const ngsiLdAsset = {
        id: `urn:ngsi-ld:DataAsset:${formData.identifier}`,
        type: "DataAsset",
        "@context": [
            "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.jsonld",
        ]
    };

    const propertiesToMap = [
        "title", "description", "license", "spatial", "version",
        "endpointURL", "endpointDescription", "image", "temporal",
        "temporalResolution",
    ];
    propertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]);
        if (ngsiLdProp) {
            ngsiLdAsset[prop] = ngsiLdProp;
        }
    });

    const datePropertiesToMap = [
        "issued", "modified", "startedAtTime", "endedAtTime", "startDate", "endDate"
    ];
    datePropertiesToMap.forEach(prop => {
        const ngsiLdProp = _createProperty(formData[prop]);
        if (ngsiLdProp) {
            ngsiLdAsset[prop] = ngsiLdProp;
        }
    });

    if (formData.keyword && Array.isArray(formData.keyword) && formData.keyword.length > 0) {
        ngsiLdAsset.keyword = _createProperty(formData.keyword);
    }

    if (formData.size !== undefined && formData.size !== null && formData.size !== '') {
        const sizeValue = parseFloat(formData.size);
        if (!isNaN(sizeValue)) {
            ngsiLdAsset.size = _createProperty(sizeValue);
        } else {
            console.warn(`Invalid 'size' value received for DataAsset: '${formData.size}'. Expected a number.`);
        }
    }

    const relationshipsToMap = {
        creator: "urn:ngsi-ld:Participant:",
        publisher: "urn:ngsi-ld:Participant:",
    };

    for (const formField in relationshipsToMap) {
        const urnPrefix = relationshipsToMap[formField];
        const ngsiLdRel = _createRelationship(formData[formField], urnPrefix);
        if (ngsiLdRel) {
            ngsiLdAsset[formField] = ngsiLdRel;
        }
    }

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
                        coordinates: [longitude, latitude]
                    }
                };
            } else {
                console.warn("Could not parse 'geometry' string for DataAsset into valid coordinates (expected 'lat,lon'):", formData.geometry);
            }
        } catch (e) {
            console.error("Error processing 'geometry' for DataAsset location:", e);
        }
    }

    return ngsiLdAsset;
}