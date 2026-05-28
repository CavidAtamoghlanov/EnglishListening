import { LEARNING_MODULES } from "../src/features/learning/config/moduleRegistry";

function main() {
  const errors: string[] = [];
  const moduleIds = new Set<string>();
  const routes = new Set<string>();

  console.log("Learning system validation report");
  console.log("---------------------------------");

  for (const module of LEARNING_MODULES) {
    console.log(`${module.id}: ${module.isAvailable ? "available" : "planned"} -> ${module.route}`);

    if (moduleIds.has(module.id)) {
      errors.push(`Duplicate module id: ${module.id}`);
    }
    moduleIds.add(module.id);

    if (!module.title.trim()) {
      errors.push(`${module.id}: title is required`);
    }
    if (!module.shortTitle.trim()) {
      errors.push(`${module.id}: shortTitle is required`);
    }
    if (!module.description.trim()) {
      errors.push(`${module.id}: description is required`);
    }
    if (!module.route.startsWith("/")) {
      errors.push(`${module.id}: route must start with /`);
    }
    if (module.isAvailable && routes.has(module.route)) {
      errors.push(`Duplicate available route: ${module.route}`);
    }
    if (module.isAvailable) {
      routes.add(module.route);
    }
  }

  for (const requiredModule of ["words", "sentences", "grammar", "writing", "review"] as const) {
    const module = LEARNING_MODULES.find((item) => item.id === requiredModule);
    if (!module?.isAvailable) {
      errors.push(`${requiredModule}: expected to be available`);
    }
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((error) => console.log(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log("\nLearning system config passed validation.");
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
