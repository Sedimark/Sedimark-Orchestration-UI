export const expectedSchemaShamrock = {
    node: {
      port: "number",
      node_id: "string"
    },
    dataset: {
      builtin_dataset: "string",
      n_splits: "number",
      split_index: "number",
      node_id: "string",
      n_workers_torch: "number"
    },
    topology: {
      topology_name: "string",
      local_epochs: "number",
      max_iter: "number",
      log_file: "string"
    },
    model: {
      optimizer: "string",
      lr: "number",
      batch_size: "number",
      loss: "string",
      metrics: "array"
    },
    seed: "number",
    framework: "string",
    log_file: "string",
    stop_condition: {
      condition: "string",
      max_aggr: "number",
      max_time: "number",
      metric_name: "string",
      metric_min: "number"
    }
  };
  

  export const expectedSchemaFleviden = {
    DEBUG: "boolean",
    VERBOSITY: "number",
    ROUNDS: "number",
    client: {
        ID: "string",
        SERVER: "string",
        EPOCHS: "number",
        BATCH_SIZE: "number",
        MODEL_PATH: "string",
        DATA_PATH: "string",
        FEATURES: "array",
        TARGETS: "array",
        PD_ARGS: "object"  // Changed to an object type
    },
    server: {
        ID: "string",
        CLIENTS: "array",
        MIN_CLIENTS: "number",
        MODEL_PATH: "string",
        DATA_PATH: "string",
        FEATURES: "array",
        TARGETS: "array",
        PD_ARGS: "object"  // Changed to an object type
    }
};