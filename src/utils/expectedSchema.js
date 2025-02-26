export const expectedSchema = {
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
  