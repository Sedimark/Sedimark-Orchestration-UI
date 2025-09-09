import React from "react";

export default function Loading() {

    return (
        <div className="loading-circle-container" style={{ marginTop: "20px" }}>                                             
            <div className="loading-circle"></div>
            <p className="loading-text" style={{ marginLeft: "45%", marginBottom: "70px" }}>Loading...</p>
        </div>
    );

}