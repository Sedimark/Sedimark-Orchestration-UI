import React from "react";
import { 
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem 
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faCircleInfo,
  faTriangleExclamation 
} from '@fortawesome/free-solid-svg-icons';



export const UploadFile = ({

    handleFileUpload,
    fileInputRef,
    setSeeTemplateDialog,
    fileName,
    configurationMenuModel,
    setConfigurationMenuModel,
    modelList,
    modelUploadError,
    handleUpload,
    framework

}) => {

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };


    return(
        <div className="shamrock-dialog-upload-file">
                    <div className="section-title">Upload configuration file</div>
                        <div className="shamrock-dialog-upload-file-btn-container">
                            
                            <div>
                                <input type="file" onChange={handleFileUpload} style={{paddingTop:"25px"}} ref={fileInputRef} accept=".yaml, .yml" id="file-upload" />
                                <label for="file-upload" class="custom-file-upload" className="button-label">
                                   UPLOAD A FILE <FontAwesomeIcon icon={faUpload} />
                              </label>
                            </div>
                          
                          <Button
                            variant="contained"
                            sx={{ backgroundColor: "blue", color: "#fff", marginTop: "20px" }}
                            onClick={() => {setSeeTemplateDialog(true)}}
                          >
                            See template <ArticleIcon className="upload-icon" />
                          </Button>


                        </div>

                      <div className="uploaded-file-name-section">

                         { fileName.length!==0 && <div> <span className="uploaded-file">Uploaded file</span>: {fileName} </div>} 

                      </div>
                        

                          <div className="variable-description configuration-menu-model-select">
                            <FontAwesomeIcon icon={faCircleInfo} />
                             The file should have the YAML extension and should comply with the template.
                          </div>

                           <Divider/>
                        <div>
                          <div className="section-title">Select a model</div>
                                        
                                <FormControl sx={{  width: "60%", mb:"10px" }}>
                                      
                                          <InputLabel id="demo-multiple-name-label"></InputLabel>
                                          <Select
                                            labelId="demo-multiple-name-label"
                                            id="demo-multiple-name"
                                            value={configurationMenuModel}
                                            onChange={(event)=>{setConfigurationMenuModel(event.target.value)}}
                                            input={<OutlinedInput label="Name" />}
                                            MenuProps={MenuProps}
                                            className="shamrock-control-input"
                                          >

                                          {   
                                                modelList.map((variableName) => (
                                                  <MenuItem
                                                    key={variableName}
                                                    value={variableName}
                                                    
                                                  >
                                                    {variableName}
                                                  </MenuItem>
                                                      )) 
                                            }

                                          </Select>                                          
                                  </FormControl>
                                           
                          </div>
                          { modelUploadError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading the models! </div>   }
                  
                        <Button variant="contained" onClick={handleUpload} style={{ marginTop: "40px" }}>
                          Save
                        </Button>
              </div>
    )
}