import "dotenv/config";
import { db } from "@/db/drizzle";
import { role } from "@/schema/role";
import { damageCategory } from "@/schema/damageCategory";
import { houseCategory } from "@/schema/houseCategory";
import { requestStatus } from "@/schema/requestStatus";

async function seed() {
  try {
    // --- Seed Roles ---
    await seedRoles()

    // --- Seed Request Status ---
    await seedRequestStatus()
    
    // --- Seed House Categories ---
    await seedHouseCategories()
    
    // --- Seed Damage Categories ---
    await seedDamageCategories()

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
}

async function seedRoles() {
    const roles = [
      { roleId: 1, roleName: "Admin" },
      { roleId: 2, roleName: "Volunteer" },
      { roleId: 3, roleName: "User" },
    ];

    await db.insert(role).values(roles);
    console.log("✅ Roles seeded");
}

async function seedRequestStatus() {
    const status = [
      { requestStatusId: 1, requestStatusName: "Pending" },
      { requestStatusId: 2, requestStatusName: "Assigned" },
      { requestStatusId: 3, requestStatusName: "In Progress" },
      { requestStatusId: 4, requestStatusName: "Completed" },
    ];

    await db.insert(requestStatus).values(status);
    console.log("✅ Request Status seeded");
}


async function seedHouseCategories() {
    const categories = [
      { houseCategoryId: 1, houseCategoryName: "Safe" },
      { houseCategoryId: 2, houseCategoryName: "Needs Retrofitting" },
      { houseCategoryId: 3, houseCategoryName: "Requires Rebuilding" },
    ];

    await db.insert(houseCategory).values(categories);
    console.log("✅ House Categories seeded");
}

async function seedDamageCategories() {
    const categories = [
      { damageCategoryId: 1, damageCategoryName: "Partially Damaged" },
      { damageCategoryId: 2, damageCategoryName: "Totally Damaged" },
    ];

    await db.insert(damageCategory).values(categories);
    console.log("✅ Damage Categories seeded");
}

seed();
