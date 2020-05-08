const fs = require('fs');
const api = require('./api.json');

api.info = {
  "title": "Fattmerchant Omni API",
  "version": require('./package.json').version,
  "description": "Fattmerchant Omni REST API for Node.js",
};

for (const path of Object.keys(api.paths)) {
  const segments = [...path.matchAll(/\{([^}]+)\}/g)].map(r => r[1]);
  for (const segment of segments) {
    for (const method of Object.keys(api.paths[path])) {
      api.paths[path][method].parameters.push({
          "name": segment,
          "in": "path",
          "description": `The ${segment} value.`,
          "required": true,
          "type": "string"
      });
      for (const param of api.paths[path][method].parameters) {
        if (param.in === "path" && !param.required) {
          param.required = true;
        }
      }
    }
  }
}

fs.writeFileSync('./api.json', JSON.stringify(api, null, 2));