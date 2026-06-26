import XLSX from "xlsx";
import { drizzle } from "drizzle-orm/neon-http";
import { eligibility } from "../schemas";

async function main() {
  const db = drizzle({
    connection: "test"
  });

  const workbook = XLSX.readFile("./src/scripts/Final_Registration_List_CSE_AI (3).xlsx");

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet);

  const data = rows.map((row:any) => ({
    rollNumber: String(row["ROLL NUMBER"]).trim(),
    studentName: String(row["NAME OF THE STUDENT"]).trim(),
    branch: String(row["BRANCH"]).trim(),
  }));

  // @ts-ignore - Bypass structural type mismatch in one-off script
  await db.insert(eligibility).values(data).onConflictDoNothing({ target: eligibility.rollNumber });

  console.log(`Imported ${data.length} students.`);
}

main().catch(console.error);
