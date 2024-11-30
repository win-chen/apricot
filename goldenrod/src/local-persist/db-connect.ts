import sqlite3Worker1Promiser from "@sqlite.org/sqlite-wasm";
import testsql from "../components/pixi-svelte/test.sql";

const log = console.log;
const error = console.error;

const LOCAL_DB = "localdb";

export const dbConnect = async () => {
  try {
    log("Loading and initializing SQLite3 module...");

    const sqliter = await sqlite3Worker1Promiser();

    log("Done initializing. Running demo...", sqliter);
    log("Running SQLite3 version", sqliter.version.libVersion);

    if (!sqliter.capi.sqlite3_vfs_find("opfs")) {
      log("OPFS is not available, aborting");
      log("Available VFS list:", sqliter.capi.sqlite3_js_vfs_list());
      return;
    } else {
      log("OPFS found!");
    }

    const db = new sqliter.oo1.OpfsDb("testdb");

    await db.exec(testsql);

    await db.exec(
      `
      INSERT INTO test (testid) VALUES ('hello');
      SELECT COUNT(*) FROM test;
    `,
      {
        callback: (row) => {
          console.log(row);
        },
      }
    );
    await db.close();
    console.log("closed");

    return db;
    // Your SQLite code here.
  } catch (err) {
    error(err);
  }
};
