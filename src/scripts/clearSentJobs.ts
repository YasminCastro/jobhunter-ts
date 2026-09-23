import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

const DB_PATH = "data/sent-jobs.db";

if (!existsSync(DB_PATH)) {
  console.log(`${DB_PATH} não existe, nada para limpar.`);
  process.exit(0);
}

const db = new DatabaseSync(DB_PATH);
const { changes } = db.prepare("DELETE FROM sent_jobs").run();
db.exec("VACUUM");
db.close();

console.log(`sent_jobs limpo: ${changes} registro(s) removido(s).`);
