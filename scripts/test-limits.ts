import { dbAdmin } from "../lib/firebase-admin";
import { checkAndReserveBackendUsage, rollbackBackendUsage } from "../lib/auth-backend";

async function createTestUser(uid: string, tier: string) {
  const profileRef = dbAdmin!.collection("profiles").doc(uid);
  await profileRef.set({
    email: `test-${uid}@example.com`,
    plan: tier,
    daily_usage: {}
  });
  // Simulate BackendUser object
  return {
    uid,
    tier: tier as any,
    profile: (await profileRef.get()).data()
  };
}

async function cleanupUser(uid: string) {
  await dbAdmin!.collection("profiles").doc(uid).delete();
}

async function testParallelAbuse(tier: string, mode: 'handwriting'|'table'|'chat', pages: number, limit: number) {
  console.log(`\n--- Testing Parallel Abuse [${tier}] [${mode}] ---`);
  const uid = `test-abuse-${tier}-${Date.now()}`;
  const user = await createTestUser(uid, tier);

  console.log(`Simulating ${limit + 2} parallel requests for ${tier} (Limit is ${limit})...`);
  const promises = [];
  for (let i = 0; i < limit + 2; i++) {
    // Send all exactly at the same time
    promises.push(checkAndReserveBackendUsage(mode, user, pages));
  }

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.allowed).length;
  const failCount = results.filter(r => !r.allowed).length;

  console.log(`Results: ${successCount} allowed, ${failCount} blocked.`);
  if (successCount === limit) {
    console.log("✅ Parallel limit enforcement WORKED.");
  } else {
    console.error(`❌ FAILED. Expected exactly ${limit} to succeed, but ${successCount} succeeded.`);
  }

  await cleanupUser(uid);
}

async function testRollback() {
  console.log(`\n--- Testing Failed OCR Rollback ---`);
  const uid = `test-rollback-${Date.now()}`;
  const user = await createTestUser(uid, 'pro');

  console.log("1. Reserving usage...");
  await checkAndReserveBackendUsage('handwriting', user, 2);

  const profileBefore = (await dbAdmin!.collection("profiles").doc(uid).get()).data()!;
  console.log(`   Usage reserved: ${profileBefore.daily_usage.handwriting_mode_usage.requests} reqs, ${profileBefore.daily_usage.handwriting_mode_usage.pages} pages`);

  console.log("2. Rolling back usage...");
  await rollbackBackendUsage(uid, 'handwriting', 2);

  const profileAfter = (await dbAdmin!.collection("profiles").doc(uid).get()).data()!;
  console.log(`   Usage after rollback: ${profileAfter.daily_usage.handwriting_mode_usage.requests} reqs, ${profileAfter.daily_usage.handwriting_mode_usage.pages} pages`);

  if (profileAfter.daily_usage.handwriting_mode_usage.requests === 0 && profileAfter.daily_usage.handwriting_mode_usage.pages === 0) {
    console.log("✅ Rollback WORKED.");
  } else {
    console.error("❌ Rollback FAILED.");
  }

  await cleanupUser(uid);
}

async function testRollbackChat() {
  console.log(`\n--- Testing Failed Chat Rollback ---`);
  const uid = `test-chat-rollback-${Date.now()}`;
  const user = await createTestUser(uid, 'free');

  console.log("1. Reserving chat usage...");
  await checkAndReserveBackendUsage('chat', user, 1);

  const profileBefore = (await dbAdmin!.collection("profiles").doc(uid).get()).data()!;
  console.log(`   Chat usage reserved: ${profileBefore.daily_usage.chatCount} reqs`);

  console.log("2. Rolling back chat usage...");
  await rollbackBackendUsage(uid, 'chat', 1);

  const profileAfter = (await dbAdmin!.collection("profiles").doc(uid).get()).data()!;
  console.log(`   Chat usage after rollback: ${profileAfter.daily_usage.chatCount} reqs`);

  if (profileAfter.daily_usage.chatCount === 0) {
    console.log("✅ Chat Rollback WORKED.");
  } else {
    console.error("❌ Chat Rollback FAILED.");
  }

  await cleanupUser(uid);
}

async function testPageLimits() {
  console.log(`\n--- Testing > 5 pages limit ---`);
  const uid = `test-pages-${Date.now()}`;
  const user = await createTestUser(uid, 'pro');

  const result = await checkAndReserveBackendUsage('handwriting', user, 6);
  if (!result.allowed) {
    console.log("✅ > 5 pages rejected correctly: ", result.error);
  } else {
    console.error("❌ FAILED. > 5 pages was allowed.");
  }
  await cleanupUser(uid);
}

async function runAll() {
  try {
    if (!dbAdmin) throw new Error("dbAdmin not initialized. Provide Firebase env vars.");
    
    // Free: 1 request max total
    await testParallelAbuse('free', 'handwriting', 1, 1);
    
    // Pro handwriting: 7 requests max
    await testParallelAbuse('pro', 'handwriting', 1, 7);

    // Plus table: 6 requests max
    await testParallelAbuse('plus', 'table', 1, 6);

    // Chat tests
    await testParallelAbuse('free', 'chat', 1, 3);
    await testParallelAbuse('trial', 'chat', 1, 10);
    await testParallelAbuse('pro', 'chat', 1, 30);
    await testParallelAbuse('plus', 'chat', 1, 80);

    await testPageLimits();
    await testRollback();
    await testRollbackChat();

    console.log("\nAll tests completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runAll();
