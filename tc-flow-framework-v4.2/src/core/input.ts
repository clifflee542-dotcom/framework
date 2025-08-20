import readline from "readline";

export interface InputProvider {
  prompt(key: string, question?: string): Promise<string>;
  select(key: string, promptText: string, options: string[], cols?: number): Promise<string>;
  yesNo(key: string, question: string): Promise<boolean>;
}

export class InteractiveInputProvider implements InputProvider {
  private rl?: readline.Interface;

  private get rlInstance() {
    if (!this.rl) {
      this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    }
    return this.rl;
  }

  private ask(q: string): Promise<string> {
    const rl = this.rlInstance;
    return new Promise((resolve) => rl.question(q, (ans) => resolve((ans ?? "").trim())));
  }

  async prompt(_key: string, question?: string): Promise<string> {
    return this.ask(question ?? "");
  }

  async select(_key: string, promptText: string, options: string[], cols: number = 1): Promise<string> {
    // print prompt
    console.log("\n" + (promptText || ""));
    // print options in columns
    for (let idx = 0; idx < options.length; idx++) {
      const line = (idx + 1) + ". " + options[idx] + (cols > 1 ? "\t" : "\n");
      process.stdout.write(line);
      if (cols > 1 && ((idx + 1) % cols === 0)) console.log("");
    }
    // ask until valid
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const num = await this.ask("Your choice: ");
      const i = parseInt(num, 10);
      if (!Number.isNaN(i) && i >= 1 && i <= options.length) return options[i - 1];
      console.log("Invalid choice. Try again.");
    }
  }

  async yesNo(_key: string, question: string): Promise<boolean> {
    console.log("\n" + (question || "") + "\n 1 - Yes\n 2 - No");
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const v = await this.ask("Your choice: ");
      if (v === "1") return true;
      if (v === "2") return false;
      console.log("Invalid input. Enter 1 or 2.");
    }
  }
}

export type Presets = Record<string, string | number | boolean>;

export class PresetInputProvider implements InputProvider {
  constructor(private presets: Presets, private fallback: InputProvider = new InteractiveInputProvider()) {}

  private get(key: string) {
    return this.presets[key];
  }

  async prompt(key: string, question?: string): Promise<string> {
    const v = this.get(key);
    if (v !== undefined && v !== null) return String(v);
    return this.fallback.prompt(key, question);
  }

  async select(key: string, promptText: string, options: string[], cols: number = 1): Promise<string> {
    const v = this.get(key);
    if (typeof v === "number") {
      const idx = v as number;
      if (idx >= 1 && idx <= options.length) return options[idx - 1];
    }
    if (typeof v === "string") {
      const s = v as string;
      const i = options.findIndex((o) => o === s);
      if (i !== -1) return options[i];
    }
    return this.fallback.select(key, promptText, options, cols);
  }

  async yesNo(key: string, question: string): Promise<boolean> {
    const v = this.get(key);
    if (typeof v === "boolean") return v as boolean;
    if (typeof v === "number") return (v as number) === 1;
    if (typeof v === "string") return (v as string).toLowerCase().startsWith("y");
    return this.fallback.yesNo(key, question);
  }
}

export let GlobalInput: InputProvider = new InteractiveInputProvider();
export function setGlobalInput(p: InputProvider) {
  GlobalInput = p;
}
