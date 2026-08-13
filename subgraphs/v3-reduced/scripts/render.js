const fs = require("node:fs");
const path = require("node:path");
const Mustache = require("mustache");

const mode = process.argv[2] || "clean";
const network = process.env.NETWORK;

if (mode !== "clean" && mode !== "graft" && mode !== "immutable-graft") {
  throw new Error(`Unknown render mode: ${mode}`);
}

if (!network || !/^[a-z0-9-]+$/.test(network)) {
  throw new Error(
    "NETWORK must name a config file, for example NETWORK=robinhood"
  );
}

const packageRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(packageRoot, "../..");
const configPath = path.join(repositoryRoot, "config", `${network}.js`);

if (!fs.existsSync(configPath)) {
  throw new Error(`Network config does not exist: ${configPath}`);
}

const config = require(configPath);
const graft = mode !== "clean";
const graftSchema = mode === "graft";
const renderConfig = { ...config, graft, graftSchema };

const template = fs.readFileSync(
  path.join(packageRoot, "template.yaml"),
  "utf8"
);
const constantsTemplate = fs.readFileSync(
  path.join(packageRoot, "src/constants/index.template.ts"),
  "utf8"
);

fs.writeFileSync(
  path.join(packageRoot, "subgraph.yaml"),
  Mustache.render(template, renderConfig)
);
fs.writeFileSync(
  path.join(packageRoot, "src/constants/index.ts"),
  Mustache.render(constantsTemplate, renderConfig)
);

if (graftSchema) {
  const schemaPath = path.join(packageRoot, "schema.graphql");
  const cleanSchema = fs.readFileSync(schemaPath, "utf8");
  const immutableEntities =
    cleanSchema.match(/@entity\(immutable: true\)/g) || [];

  if (immutableEntities.length === 0) {
    throw new Error(
      "The clean schema has no immutable entities to make graft-compatible"
    );
  }

  fs.writeFileSync(
    path.join(packageRoot, "schema.graft.graphql"),
    cleanSchema.replace(/@entity\(immutable: true\)/g, "@entity")
  );
}
