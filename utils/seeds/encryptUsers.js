require("dotenv").config();
const mongoose = require("mongoose");
const UserManager = require("../../models/userManager.model");
const { encrypt } = require("../crypto");

const SENSITIVE_FIELDS = [
  "SAO_email",
  "SAO_phone",
  "SAO_student_socialNumber",
  "SAO_company_idManager",
  "SAO_student_address",
  "SAO_company_address"
];

async function run() {
  await mongoose.connect(process.env.MONGODB_ATLAS);

  console.log("🔐 Iniciando cifrado de datos existentes...");

  const users = await UserManager.find();

  let updatedCount = 0;

  for (const user of users) {
    let modified = false;

    SENSITIVE_FIELDS.forEach(field => {
      if (
        user[field] &&
        typeof user[field] === "string" &&
        !user[field].startsWith("enc:")
      ) {
        user[field] = encrypt(user[field]);
        modified = true;
      }
    });

    if (modified) {
      await user.save({ validateBeforeSave: false });
      updatedCount++;
    }
  }

  console.log(`✅ Cifrado completado. Usuarios actualizados: ${updatedCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Error en la seed:", err);
  process.exit(1);
});