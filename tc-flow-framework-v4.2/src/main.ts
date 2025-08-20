import { runFlow } from "./core/flow.js";
import fs from "fs";
(async () => {
  const flow = process.env.FLOW || "flows/test-flow/developer/dev-flow.json";
  if (!fs.existsSync(flow)) {
    console.error("Flow not found:", flow);
    process.exit(1);
  }
  await runFlow(flow);
})();
