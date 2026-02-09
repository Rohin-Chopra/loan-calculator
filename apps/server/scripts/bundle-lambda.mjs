import { execSync } from "child_process";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const srcDir = join(rootDir, "src");
const packageDir = join(rootDir, "packages");

const functions = [
  "create-loan",
  "get-loan",
  "list-loans",
  "update-loan",
  "delete-loan",
];

// Ensure packages directory exists
if (!existsSync(packageDir)) {
  mkdirSync(packageDir, { recursive: true });
}

console.log("Packaging Lambda functions with esbuild...\n");

// Read package.json to get dependencies
const packageJson = JSON.parse(
  readFileSync(join(rootDir, "package.json"), "utf-8"),
);
const dependencies = packageJson.dependencies || {};

async function packageFunctions() {
  for (const func of functions) {
    console.log(`Packaging ${func}...`);

    const funcPackageDir = join(packageDir, func);

    // Create function package directory
    if (!existsSync(funcPackageDir)) {
      mkdirSync(funcPackageDir, { recursive: true });
    }

    const entryPoint = join(srcDir, "functions", `${func}.ts`);
    const outputFile = join(funcPackageDir, "index.js");

    // Bundle with esbuild
    console.log(`  Bundling ${func} with esbuild...`);
    await build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: "node",
      target: "node20",
      format: "cjs",
      outfile: outputFile,
      external: [
        // AWS SDK is available in Lambda runtime
        "@aws-sdk/*",
        // Keep these external as they're Lambda runtime dependencies
      ],
      minify: true,
      sourcemap: false,
      treeShaking: true,
      logLevel: "info",
    });

    // Create package.json with only runtime dependencies
    const funcPackageJson = {
      name: func,
      version: "1.0.0",
      main: "index.js",
      dependencies: dependencies,
    };
    writeFileSync(
      join(funcPackageDir, "package.json"),
      JSON.stringify(funcPackageJson, null, 2),
    );

    // Install production dependencies
    console.log(`  Installing dependencies for ${func}...`);
    execSync("npm install --production --no-save", {
      cwd: funcPackageDir,
      stdio: "inherit",
    });

    // Create zip file
    const zipFile = join(packageDir, `${func}.zip`);
    console.log(`  Creating ${func}.zip...`);
    execSync(
      `cd ${funcPackageDir} && zip -r ${zipFile} . -x "*.zip" "node_modules/.bin/*" "*.log" "*.map"`,
      {
        stdio: "inherit",
      },
    );

    console.log(`✓ ${func} packaged\n`);
  }

  console.log("All functions packaged successfully!");
}

packageFunctions().catch((error) => {
  console.error("Error packaging functions:", error);
  process.exit(1);
});
