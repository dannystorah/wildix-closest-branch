#!/usr/bin/env node

/**
 * tests/run-tests.ts - Run all unit tests
 */

async function runTests() {
  console.log("\n");
  console.log("█".repeat(50));
  console.log("WILDIX CLOSEST LOCATION - TEST SUITE");
  console.log("█".repeat(50));
  console.log("\n");

  try {
    // Import and run validation tests
    console.log("1/3 Running validation tests...\n");
    await import("./validation.test.js");

    // Import and run distance tests
    console.log("2/3 Running distance calculation tests...\n");
    await import("./distance.test.js");

    // Import and run maps URL tests
    console.log("3/3 Running Maps URL tests...\n");
    await import("./maps-url.test.js");

    console.log("█".repeat(50));
    console.log("ALL TESTS COMPLETED SUCCESSFULLY");
    console.log("█".repeat(50));
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test suite error:", error);
    process.exit(1);
  }
}

runTests();
