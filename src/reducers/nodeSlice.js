import {createSlice, nanoid} from '@reduxjs/toolkit'
import { act } from 'react';

const initialState = {
    selectedView:[1],
    nodes:[],
    selectedTrainedModel:"",
    isPredictSelected:false,
    datasetColumnNames:[],
    selectedPipeline:[],
    selectedModelType:"",
    edgeToDelete:"",
    mappedNodes:[], 
    edges:[],
    mageAIOauthToken:"",
    runningPipelines: [],
    dataset_info:[], 
    dataset_columns:[],
    is_data_fetching:false,
    blocksVariables:[],
    orderedNodes: [],
    selectedPipelineName: "",
    selectedPipelineNameDataPreprocessing:"",
    selectedPipelineNameTrain:"",
    selectedPipelineNamePrediction:"",
    selectedPipelineNameStreaming: "",
    storedNodes:[],
    selectedPipelineTrain:[],
    selectedPipelineDataPreprocessing:[],
    selectedPipelinePrediction:[],
    selectedPipelineStreaming: [],
    noPipelineFound:false,
    selectedTab:{"changed":false, tabSelected:"1"},
    mapData:"",
    typeForModel:"",
    versionForModel : "",
    pipelineNrOfVariables:[], 
    selectedModelVersion:{},
    pipelineStudioNodes:[],
    pipelineStudioEdges:[],
    pipelineStudioEdgeToDelete:"",
    pipelineStudioFirstTime:true,
    pipelineStudioPipelineType:"",
    pipelineStudioPipelineName:"",
    blockCatalogSelectedOptions:[],
    generatedBlockCode:"",
    generatedBlockName:"",
    resultsGenerated:false,
    blockIsGenerating:false,
    generatedBlockType:"",
    editorValue:"",
    generateBlockPayload:{},
    socketBlockIsGenerating:false,
    generatedBlockData:{},
    generatedBlockResult:"",
    blockWasGenerated: false,
    notifyBlockGenerated:false,
    errorWhileGenerating: false,
    shamrockFileName:"",
    shamrockValues:{},
    shamrockPipelineName:"",
    shamrockIsPipelineNameValid:"",
    shamrockNodes:[],
    shamrockEdges:[],
    shamrockNodeChanged:{},
    pipelinesBlocks:{},
    blockPrompt:"",
    fullYAMLDocument:{},
    shamrockValueIsModified:false,
    shamrockWasSaved:false,
    shamrockLastSavedPipeline:"",
    shamrockIsBeingSaved: false,
    shamrockRunData:null,
    shamrockModelUploadedFileName:"",
    shamrockModelName:"",
    brokerEntityId:"",
    tabIndex:1,
    allTabs:[]
}    

export const nodeSlice = createSlice({
    name:'nodes',
    initialState,
    reducers:{
        setTabIndex:(state, action)=>{
            state.tabIndex = action.payload;
        },
        setAllTabs:(state, action)=>{
            state.allTabs = action.payload;
        },
        setBrokerEntityId:(state, action)=>{
            state.brokerEntityId = action.payload;
        },
        setShamrockModelName:(state, action)=>{
            state.shamrockModelName = action.payload;
        },
        setShamrockModelUploadedFileName:(state, action)=>{
            state.shamrockModelUploadedFileName = action.payload;
        },
        setShamrockRunData:(state, action)=>{
            state.shamrockRunData = action.payload;
        },
        setShamrockIsBeingSaved:(state, action)=>{
            state.shamrockIsBeingSaved = action.payload;
        },
        setShamrockWasSaved:(state, action)=>{
            state.shamrockWasSaved = action.payload;
        },
        setShamrockLastSavedPipeline:(state, action)=>{
            state.shamrockLastSavedPipeline = action.payload;
        },
        setShamrockEdges:(state, action)=>{
            state.shamrockEdges = action.payload;
        },
        setShamrockNodeChanged:(state , action)=>{
            state.shamrockNodeChanged = action.payload;
        },
        setShamrockNodes:(state, action)=>{
            state.shamrockNodes = action.payload;
        },
        setShamrockValueIsModified:(state, action)=>{
            state.shamrockValueIsModified = action.payload;
        },
        setFullYAMLDocument:(state, action)=>{
            state.fullYAMLDocument = action.payload;
        },
        setShamrockIsPipelineNameValid:(state, action)=>{
            state.shamrockIsPipelineNameValid = action.payload;
        },
        setSharmockPipelineName:(state,action)=>{
            state.shamrockPipelineName = action.payload;
        },
        setShamrockFileName:(state, action)=>{
            state.shamrockFileName = action.payload;
        },
        setShamrockValues:(state, action)=>{
            state.shamrockValues = action.payload;
        },
        setBlockPrompt:(state, action)=>{
            state.blockPrompt = action.payload;
        },
        setGeneratedBlockData:(state, action)=>{
            state.generatedBlockData = action.payload;
        },
        setPipelinesBlocks:(state, action)=>{
            state.pipelinesBlocks = action.payload;
        },
        setRunningPipelines:(state, action)=>{
            state.runningPipelines = action.payload;
        },
        setErrorWhileGenerating:(state, action)=>{
            state.errorWhileGenerating = action.payload;
        },
        setNotifyBlockGenerated:(state, action)=>{
            state.notifyBlockGenerated = action.payload;
        },
        setGeneratedBlockResult:(state, action)=>{
            state.generatedBlockResult = action.payload;
        },
        setGeneratedBlockPayload:(state, action) =>{
            state.generateBlockPayload = action.payload;
        },
        setBlockWasGenerated:(state, action)=>{
            state.blockWasGenerated = action.payload;
        },
        setSocketBlockIsGenerating:(state, action)=>{
            state.socketBlockIsGenerating = action.payload;
        },  
        setStoredPipelineName:(state, action)=>{
            state.pipelineStudioPipelineName = action.payload;
        },
        setStoredGeneratedBlockType:(state, action)=>{
            state.generatedBlockType = action.payload;
        },
        setStoredGeneratedBlockName:(state, action)=>{
            state.generatedBlockName = action.payload;
        } ,
        setGeneratedBlockCode:(state, action)=>{
            state.generatedBlockCode = action.payload;
        },
        setResultsGenerated:(state, action)=>{
            state.resultsGenerated = action.payload;
        },
        setStoredBlockIsGenerating:(state, action)=>{
            state.blockIsGenerating = action.payload;
        },
        setEditorValueBlockGenerating:(state, action)=>{
            state.editorValue = action.payload;
        },
        setBlockCatalogSelectedOptions: (state, action)=>{
            state.blockCatalogSelectedOptions = action.payload;
        },
        setPipelineStudioFirstTime:(state, action)=>{
            state.pipelineStudioFirstTime = action.payload;
        },
        setPipelineStudioPipelineType:(state, action)=>{
            state.pipelineStudioPipelineType = action.payload;
        },
        setPipelineStudioNodes:(state,action)=>{
            state.pipelineStudioNodes = action.payload;
        },
        setPipelineStudioEdges:(state, action)=>{
            state.pipelineStudioEdges = action.payload;
        },
        setPipelineStudioEdgeToDelete:(state, action)=>{
            state.pipelineStudioEdgeToDelete = action.payload;
        },
        addNode: (state,action) => {
            
            const newNode = {
                id:nanoid(),
                nodeData:action.payload
            }
            const containsID = state.nodes.filter(obj => obj.nodeData.type === action.payload.type );
            if(containsID.length == 0)
            {
                state.nodes.push(newNode);
            }
            
        },
        setSelectModelVersionStore:(state, action)=>{
            state.selectedModelVersion = action.payload;
        },
        setTypeForModel:(state, action)=>{
            state.typeForModel = action.payload;
        },
        setVersionForModel:(state, action)=>{
            state.versionForModel = action.payload;
        },
        setPipelineNumberOfVariables:(state,action)=>{
            state.pipelineNrOfVariables = action.payload;
        },
        setSelectedTrainedModel:(state, action)=>{
            state.selectedTrainedModel = action.payload;
        },
        setIsPredictedSelected:(state, action)=>{
            state.isPredictSelected = action.payload;
        },
        setStoredNodes:(state, action)=>{
            state.storedNodes = action.payload;
        },
        setBlocksVariables:(state,action)=>{
            state.blocksVariables = action.payload;
        },
        setIsDataFetching:(state,action)=>{
            state.is_data_fetching = action.payload;
        },
        setDatasetColumns:(state,action)=>{
            state.dataset_columns = action.payload;
        },
        setDatasetInfo:(state,action)=>{
            state.dataset_info = action.payload;
        },
        setMappedNodes:(state, action)=>{
            state.mappedNodes = action.payload;
        },
        setMappedEdges:(state, action)=>{
            state.edges = action.payload
        },
        setNodes:(state, action)=>{
            
            state.nodes = action.payload
        },
        removeNode:(state, action) =>{
            state.nodes = state.nodes.filter((node)=> node.id !== action.payload)
        }, 
        resetSelectedModelType:(state, action)=>{
            state.selectedModelType = "";
        },
        clearPipeline:(state,action)=>{
            state.selectedPipeline = [];
        },
        addPipeline:(state,action) =>{
            state.selectedPipeline = [];
            state.selectedPipeline = [action.payload]
        },
        setSelectedModelType:(state,action)=>{
            state.selectedModelType = action.payload;
        },
        setEdgeToDelete:(state,action)=>{
            
            state.edgeToDelete = action.payload;
        },
        setMageAIOauthToken:(state, action)=>{
            state.mageAIOauthToken = action.payload;
        },
         setOrderedNodes:(state, action) => {
            state.orderedNodes = action.payload;
         }, 
         setSelectedPipelineName:(state, action) => {
            state.selectedPipelineName = action.payload;
         },

         setDatasetColumnNames:(state, action)=>{
            state.datasetColumnNames = action.payload;
         },
         Train:(state, action)=>{
            state.selectedPipelineTrain = [];
            state.selectedPipelineTrain = [action.payload];
        },
        addPipelinePreprocessing:(state, action)=>{    
            state.selectedPipelineDataPreprocessing = [];
            state.selectedPipelineDataPreprocessing = [action.payload];
        },
        addPipelineTrain:(state, action)=>{    
            state.selectedPipelineTrain = [];
            state.selectedPipelineTrain = [action.payload];
        },
        addPipelineStreaming:(state, action)=>{    
            state.selectedPipelineStreaming = [];
            state.selectedPipelineStreaming = [action.payload];
        },
        clearPipelineProcessing:(state, action)=>{
            state.selectedPipelineDataPreprocessing = [];
        },
        clearPipelineTrain:(state, action)=>{
            state.selectedPipelineTrain = [];
        },
        clearPipelineStreaming:(state, action)=>{
            state.selectedPipelineStreaming = []
        },
        setSelectedPipelineNameTrain:(state, action)=>{ 
            state.selectedPipelineNameTrain = action.payload;
        },
        setSelectedPipelineNameStreaming:(state,action)=>{
            state.selectedPipelineNameStreaming = action.payload;
        },
        setSelectedPipelineNamePreprocessing:(state, action)=>{
         
            state.selectedPipelineNameDataPreprocessing = action.payload;
        },
        setSelectedView:(state,action)=>{
            state.selectedView = action.payload;
        },
        setSelectedPipelinePrediction:(state,action)=>{
            state.selectedPipelinePrediction = action.payload;
        },
        setSelectedPipelineNamePrediction:(state,action)=>{
            state.selectedPipelineNamePrediction = action.payload;
        },
        setMapData:(state,action)=>{
            state.mapData = action.payload;
        },
        
        setNoPipelineFound:(state,action)=>{
            state.noPipelineFound = action.payload;
        },

        setSelectedTab:(state, action) =>{
            state.selectedTab = action.payload;
        }

    }
});


export const { 
    setRunningPipelines,
    clearPipelineStreaming,
    setSelectModelVersionStore,
    setTypeForModel,
    setVersionForModel,
    setPipelineNumberOfVariables,
    setSelectedTab,
    setNoPipelineFound,
    setSelectedPipelineNamePrediction,
    setSelectedPipelinePrediction,
    setSelectedTrainedModel,
    setIsPredictedSelected,
    setSelectedView,
    clearPipelineProcessing,
    clearPipelineTrain,
    setSelectedPipelineNameTrain,
    setSelectedPipelineNamePreprocessing,
    addPipelinePreprocessing,
    addPipelineTrain,
    setDatasetColumnNames,
    setStoredNodes,
    setBlocksVariables,
    setIsDataFetching,
    setDatasetColumns,
    setDatasetInfo,
    setMappedNodes,
    setMappedEdges,
    resetSelectedModelType,
    addNode,
    setNodes,
    removeNode,
    addPipeline,
    addAlgorithm, 
    setSelectedModelType,
    setSelectedDataFeaturingColumns,
    setEdgeToDelete,
    clearPipeline,
    setMageAIOauthToken,
    setOrderedNodes,
    setSelectedPipelineName,
    setMapData,
    addPipelineStreaming,
    setSelectedPipelineNameStreaming,
    setPipelineStudioNodes,
    setPipelineStudioEdges,
    setPipelineStudioEdgeToDelete,
    setPipelineStudioPipelineType,
    setPipelineStudioFirstTime,
    setBlockCatalogSelectedOptions,
    setStoredPipelineName,
    setGeneratedBlockCode,
    setResultsGenerated,
    setStoredBlockIsGenerating,
    setEditorValueBlockGenerating,
    setStoredGeneratedBlockName,
    setStoredGeneratedBlockType,
    setGeneratedBlockPayload,
    setPipelinesBlocks,
    // ** Those values are for socket **//
    setSocketBlockIsGenerating,
    setBlockWasGenerated,
    setGeneratedBlockResult,
    setNotifyBlockGenerated,
    setErrorWhileGenerating,
    setGeneratedBlockData,
    // ** Those values are for shamrock **//
    setShamrockValues,
    setShamrockFileName,
    setSharmockPipelineName,
    setShamrockIsPipelineNameValid,
    setFullYAMLDocument,
    setShamrockValueIsModified,
    setShamrockEdges,
    setShamrockNodes,
    setShamrockNodeChanged,
    setShamrockWasSaved,
    setShamrockLastSavedPipeline,
    setShamrockIsBeingSaved,
    setShamrockRunData,
    setShamrockModelUploadedFileName,
    setShamrockModelName,
    setBrokerEntityId,
    setTabIndex,
    setAllTabs
    
} = nodeSlice.actions

export default nodeSlice.reducer;