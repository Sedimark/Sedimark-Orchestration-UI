// --- Helper Functions (can be placed in a 'utils' file or within the same module) ---

/**
 * Retrieves full tab information by tab name.
 * @param {string} tabName - The name of the tab to find.
 * @param {Array<Object>} allTabsStored - The array of all stored tab objects.
 * @returns {Object|undefined} The full tab object or undefined if not found.
 */
const getTabInfoByName = (tabName, allTabsStored) => {
    return allTabsStored.find(item => item.name === tabName);
};

/**
 * Finds all child pipeline tabs linked to a given parent pipeline name.
 * @param {string} parentPipelineName - The pipeline name of the parent tab.
 * @param {Array<Object>} allTabsStored - The array of all stored tab objects.
 * @returns {Array<Object>} An array of full tab objects for the children.
 */
const findChildPipelineTabs = (parentPipelineName, allTabsStored) => {
    const children = [];
    for (const tab of allTabsStored) {
        if (tab.parentPipeline === parentPipelineName) {
            children.push(tab);
        }
    }
    return children;
};

/**
 * Determines all tabs (parent and its children) that need to be deleted.
 * This is the core logic for identifying the full set of tabs to remove.
 * @param {string} initialTabName - The name of the tab initially targeted for deletion.
 * @param {Array<Object>} allTabsStored - The array of all stored tab objects.
 * @returns {Array<Object>} An array of full tab objects to be deleted.
 */
const getTabsToDelete = (initialTabName, allTabsStored) => {
    const initialTab = getTabInfoByName(initialTabName, allTabsStored);
    if (!initialTab) {
        console.warn(`Initial tab '${initialTabName}' not found.`);
        return [];
    }

    let tabsToDelete = [initialTab];
    // Check if the initial tab has child pipelines
    const childTabs = findChildPipelineTabs(initialTab.pipelineName, allTabsStored);
    if (childTabs.length > 0) {
        tabsToDelete = [...tabsToDelete, ...childTabs];
    }

    return tabsToDelete;
};

/**
 * Clears relevant items from sessionStorage for the given tabs.
 * @param {Array<Object>} tabsInfoArray - Array of full tab objects to clear session storage for.
 */
const clearSessionStorageForTabs = (tabsInfoArray) => {
    tabsInfoArray.forEach(tab => {
        // Assuming 'pipelineName' and 'tabOrder' are consistent for sessionStorage keys
        sessionStorage.removeItem(`${tab.tabOrder}-${tab.pipelineName}-runData`);
        sessionStorage.removeItem(`${tab.tabOrder}-${tab.pipelineName}-running-steps`);
    });
};

/**
 * Filters Redux states (tab indexes, all tabs, block variables) to remove data related to the tabs being deleted.
 * @param {Array<Object>} tabsInfoArray - Array of full tab objects to be deleted.
 * @param {Array<number>} currentTabIndexes - Current array of tab order indexes.
 * @param {Array<Object>} currentAllTabs - Current array of all stored tab objects.
 * @param {Array<Object>} currentBlocksVariables - Current array of block variables.
 * @returns {Object} An object containing the new filtered states: { newTabIndexes, newTabArr, newVariables }.
 */
const filterReduxStates = (tabsInfoArray, currentTabIndexes, currentAllTabs, currentBlocksVariables) => {
    const tabNamesToDelete = tabsInfoArray.map(tab => tab.name);
    const tabOrdersToDelete = tabsInfoArray.map(tab => tab.tabOrder);

    const newTabIndexes = currentTabIndexes.filter(tabOrder => !tabOrdersToDelete.includes(tabOrder));
    const newTabArr = currentAllTabs.filter(item => !tabNamesToDelete.includes(item.name));
    const newVariables = currentBlocksVariables.filter(item => !tabNamesToDelete.includes(item.tabName));

    return { newTabIndexes, newTabArr, newVariables };
};

/**
 * Dispatches Redux actions to update the store with the new filtered states.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Object} newStates - Object containing newTabIndexes, newTabArr, newVariables.
 * @param {Function} setTabIndex - Redux action creator for tab indexes.
 * @param {Function} setBlocksVariables - Redux action creator for block variables.
 * @param {Function} setAllTabs - Redux action creator for all tabs.
 */
const dispatchTabActions = (dispatch, { newTabIndexes, newTabArr, newVariables }, setTabIndex, setBlocksVariables, setAllTabs) => {
    dispatch(setTabIndex(newTabIndexes));
    dispatch(setBlocksVariables(newVariables));
    dispatch(setAllTabs(newTabArr));
};

/**
 * Updates the selected tab in the UI after deletion.
 * @param {Array<Object>} newTabArr - The updated array of all tabs after deletion.
 * @param {Function} setSelectedTabHere - Function to set the locally selected tab (e.g., from useState).
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} setSelectedView - Redux action creator for selected view.
 * @param {Function} setTabIndex - Redux action creator for tab indexes (used to clear if no tabs left).
 */
const updateSelectedTab = (newTabArr, setSelectedTabHere, dispatch, setSelectedView, setTabIndex) => {
    if (newTabArr.length > 0) {
        // Select the first remaining tab, or implement more sophisticated logic
        const newSelectedTab = newTabArr[0];
        setSelectedTabHere(newSelectedTab);
        dispatch(setSelectedView(newSelectedTab));
    } else {
        // If no tabs left, clear all selections
        setSelectedTabHere(null);
        dispatch(setSelectedView(null));
        dispatch(setTabIndex(null)); // Clear global tab index if no tabs
    }
};

// --- The Main closeTab Function ---

/**
 * Handles the complete process of closing a tab, including linked child pipelines,
 * updating Redux state, and clearing session storage.
 *
 * @param {string} tabInfo - The name of the tab to initiate deletion.
 * @param {Object} dependencies - An object containing all necessary data and dispatch functions.
 * @param {Array<Object>} dependencies.allTabsStored - Current Redux state for all tabs.
 * @param {Array<number>} dependencies.tabIndexes - Current Redux state for tab indexes.
 * @param {Array<Object>} dependencies.blocksVariablesStored - Current Redux state for block variables.
 * @param {Function} dependencies.dispatch - The Redux dispatch function.
 * @param {Function} dependencies.setTabIndex - Redux action creator for tab indexes.
 * @param {Function} dependencies.setBlocksVariables - Redux action creator for block variables.
 * @param {Function} dependencies.setAllTabs - Redux action creator for all tabs.
 * @param {Function} dependencies.setSelectedView - Redux action creator for selected view.
 * @param {Function} dependencies.setSelectedTabHere - Local state setter for the currently selected tab.
 */
export const closeTab = (tabInfo, {
    allTabsStored,
    tabIndexes,
    blocksVariablesStored,
    dispatch,
    setTabIndex,
    setBlocksVariables,
    setAllTabs,
    setSelectedView,
    setSelectedTabHere
}) => {
    // 1. Identify all tabs to be deleted (initial tab + its children)
    const tabsToDelete = getTabsToDelete(tabInfo, allTabsStored);

    if (tabsToDelete.length === 0) {
        console.log("No tabs found to delete or initial tab not found.");
        return;
    }

    // 2. Clear session storage for all identified tabs
    clearSessionStorageForTabs(tabsToDelete);

    // 3. Filter Redux states based on tabs to delete
    const { newTabIndexes, newTabArr, newVariables } = filterReduxStates(
        tabsToDelete,
        tabIndexes,
        allTabsStored,
        blocksVariablesStored
    );

    // 4. Dispatch Redux actions to update the store
    dispatchTabActions(dispatch, { newTabIndexes, newTabArr, newVariables }, setTabIndex, setBlocksVariables, setAllTabs);

    // 5. Update the selected tab in the UI
    updateSelectedTab(newTabArr, setSelectedTabHere, dispatch, setSelectedView, setTabIndex);
};