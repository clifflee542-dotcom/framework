import { Page } from 'playwright';
import { GlobalInput } from './core/input.js';

export const SAP_DOC_TYPES = ["AM","AD","PSD","CM","PSM","TSD","CD","TCM","TCD","PCB","SYM","GBR","SP","FS","PDD","PDM","ES","PS","TDM","TDD"];
export const SUBTYPE_MAP: Record<string, string[]> = {
  ANALYSIS: ["Analysis Design Drawing","Product Analysis Model","Structural Analysis Model","Thermal Analysis Model","Tooling Analysis Drawing","Tooling Analysis Model","Electrical Analysis Model","Molding Analysis Model","Tolerance Analysis Model","Tolerance Analysis Drawing"],
  CUSTOMER: ["Product Customer Drawing","Product Customer Model","Tooling Customer Drawing","Tooling Customer Model","Illustration Reference Model"],
  PACKAGING: ["Packaging Design Drawing","Packaging Design Model"],
  PRODUCT: ["Product Design Drawing","Product Design Model"],
  TOOLING: ["Mold/Die Wizard Drawing","Mold/Die Wizard Model","Tooling Design Drawing","Tooling Design Model"]
};
export const Search_Type = [
  "Any Category", "Any Item Revision", "ICandidate Part Request Revision", "Change Order Revision",
  "Change Request Revision", "Commercial Part Revision", "Document Revision", "ECAD Collector Revision",
  "Feature Revision", "Manufacturer Part Revision", "Mech Design Revision",
  "PCA Revision", "Packaging Part Revision", "Problem Report Revision",
  "Product Part Revision", "Part Revision", "Product Part Revision", "RPM",
  "Raw Material Revision", "Schem Revision", "Series Number",
  "Software Revision", "Tooling Design Request Revision", "Tooling Part Revision"
];
export const MOLEX_RESTRICTION = ["Molex Internal","Restricted Customer","General Market","Restricted Molex Internal"];
export const PROBLEM_CHANGE_TYPE = ["Customer Complaint - non QN","Customer Complaint - QN","Commercial Part Change/Raw Material Change","Document - Change","Document - New","Manufacturing Change","Product Design - Change","Product Design - New","Reactivate","Supply Chain","Test Failure","Tooling - Change","Tooling - New"];
export const PRIMARY_CHANGE_REASON = ["Business Requirement","Cost Change","Customer Requirement","Document Change / Update","Equipment Transfer, Production Transfer, or Rearrangment","Facility/Building/Utility Change","Inspection Test / Method Change","IT / Software Change","Labelling Change","Manufacturing Process Change","Obsolete / Inactive","Packaging Method / Quantity Changing","Product (Fit, Form, Function) Change","Product Quality","Production Requirement","QMS Change","Reactivate Product (Retraction)","Regulatory Requirement","Restart of Inactive Manufacturing Process / Tool","Supplier Change","Tooling (Mold, Die, Assembly, Plating) Change","Tooling Replacement or Capacity Change","Vendor / Supplier Requirement"];

export async function selectFromList(key: string, promptText: string, options: string[], cols: number = 1): Promise<string> { return GlobalInput.select(key, promptText, options, cols); }
export async function yesNoPrompt(key: string, question: string): Promise<boolean> { return GlobalInput.yesNo(key, question); }
export async function ask(key: string, question: string): Promise<string> { return GlobalInput.prompt(key, question); }

export async function login(page: Page): Promise<string> {
  const baseUrl = await ask('login.baseUrl', 'Base URL: ');
  await page.goto(baseUrl);
  const username = await ask('login.username', 'username: ');
  const password = await ask('login.password', 'password: ');
  await page.getByRole('textbox', { name: 'username' }).fill(username);
  await page.getByRole('textbox', { name: 'password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  return username;
}
