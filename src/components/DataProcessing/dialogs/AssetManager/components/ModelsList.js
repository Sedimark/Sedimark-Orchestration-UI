import React, {useEffect} from "react";
import {  faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ModelsList ({fullModelsList}) {

    return(
         <div className="simple-models-list-wrapper">
            <div className="models-list-title">Models List</div>
                <div className="model-assets-grid"> {/* Changed to grid for better layout */}
                    { fullModelsList && fullModelsList.map((model) => {
                        return (
                        <div key={model.id} className="model-asset-container">
                            {/* Added a Font Awesome icon for visual interest */}
                            <FontAwesomeIcon icon={faTag} className="model-icon" />
                            <span className="model-name-text">{model.name}</span>
                        </div>
                        );
                    })}
                {/* Optional: Add a message if the list is empty */}
                { (!fullModelsList || fullModelsList.length === 0) && (
                    <p className="no-models-message">No models available.</p>
                )}
                </div>
        </div>
    );

}