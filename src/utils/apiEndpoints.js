const {DEVELOPMENT} = process.env
const base_url = DEVELOPMENT ? "https://apis.sedimark.work" : "http://ingress-nginx-controller.default.svc.cluster.local";

export const FETCH_PIPELINES = `${base_url}/mage/pipelines`;
export const FETCH_MAGE_AI_OAUTH_KEY = `https://mage.sedimark.work/api/sessions`;
export const FETCH_PIPELINE_DATA = (pipeline_name)=>`${base_url}/mage/pipeline/read/full?pipeline_name=${pipeline_name}`;
export const FETCH_PIPELINE_PREDICT_DATA = (pipeline_name)=>`${base_url}/mage/pipeline/read/predict/full?model_name=${pipeline_name}`;
export const FETCH_MINIO_FILE = (pipeline_name) => `${base_url}/balancer/get_object?dataset_path=${pipeline_name}/statistics.json&forever=false`;
export const FETCH_MINIO_SAMPLE = (pipeline_name) => `${base_url}/balancer/get_object?dataset_path=${pipeline_name}/head.json&forever=false`;
export const FETCH_PIPELINE_RUN_DATA = (pipeline_name) => `${base_url}/mage/pipeline/triggers?name=${pipeline_name}`;
export const RUN_PIPELINE = "${base_url}/mage/pipeline/run";
export const BLOCK_STATUS = (pipeline_id, block_name) => `${base_url}/mage/pipeline/status_once?pipeline_id=${pipeline_id}&block_name=${block_name}`;
export const GET_ALL_MODELS = `${base_url}/sm/models`;
export const GET_PARAMETERS_FOR_MODEL = (model_name,version)=>`${base_url}/sm/model/parameters?name=${model_name}&version=${version}`;
export const GET_METRICS_FOR_MODEL = (model_name, version)=>`${base_url}/sm/model/metrics?name=${model_name}&version=${version}`;
export const GET_TRAINING_METRICS_IMAGES = (model_name, version) => `${base_url}/sm/model/images?name=${model_name}&version=${version}`;
export const PIPELINE_STATUS = (pipeline_id) => `${base_url}/mage/pipeline/batch_status?pipeline_id=${pipeline_id}`;
export const PIPELINE_HISTORY = (pipeline_name, limit) => `${base_url}/mage/pipeline/history?pipeline_name=${pipeline_name}&limit=${limit}`;
export const PREDICT_RESULTS_LINK = (model_name) => `${base_url}/balancer/get_object?dataset_path=${model_name.split("_").join("-")}/map.html&forever=false`;
export const MODEL_VERSION = (model_name) => `${base_url}/sm/model/versions?name=${model_name}`;