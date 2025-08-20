import { Page } from 'playwright';
import { ask } from '../utils.js';
const Plant_Code_for_PCN = [
  '1199-Molex Japan LLC','1201-Molex Singapore Pte Ltd','2601-Molex Interconnect Shanghai Co.Ltd.',
  '2701-Molex Interconnect (Chengdu)Co., Ltd','1701-Dongguan Molex Interconnect Co. Ltd',
  '1501-Molex (Thailand) Ltd.','2201-Molex Korea Ltd.','2101-Molex Taiwan Ltd., Sanchong Branch'
];
const Priority = ['Urgent','Standard'];
const Business_Impact = ['Low','Medium','High'];
async function selectFromEnum(key: string, enumList: string[], promptText: string): Promise<string> {
  const num = parseInt(await ask(key, `Select ${promptText} 1-${enumList.length}: `), 10);
  return enumList[Math.max(1, Math.min(enumList.length, num)) - 1];
}
export async function runWorkflow(page: Page, username?: string) {
  const ID = await ask('runWorkflow.item_id', 'Enter item id: ');
  const selected_priority = await selectFromEnum('runWorkflow.priority', Priority, 'Priority');
  const selected_impact = await selectFromEnum('runWorkflow.business_impact', Business_Impact, 'Business Impact');
  const selected_plant = await selectFromEnum('runWorkflow.plant_code', Plant_Code_for_PCN, 'Plant Code');
  const decision = (await ask('runWorkflow.pcn_required', 'PCN Required? 1-Yes 2-No: ')) === '1' ? 'Yes' : 'No';
  const reason = await ask('runWorkflow.reason', 'Enter your reason for change: ');
  console.log('Executing run_workflow...');
  await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 50000 });
  await page.locator(`div.aw-splm-tableCellText[title="${ID}"]`, { hasText: ID }).first().click();
  await page.locator('.flex-wrap > button.sw-button', { hasText: 'Complete' }).click();
  await page.reload();
  await page.locator('button.aw-commandId-Awp0EditGroup').click();
  await page.locator('.aw-widgets-cellListItem[aria-label="Summary"]').click();
  await page.locator('input.sw-property-val[aria-label="Priority"]').fill(selected_priority);
  await page.locator('input.sw-property-val[aria-label="Business Impact"]').fill(selected_impact);
  await page.waitForSelector('.sw-property-val[aria-label="Plant Code for PCN"]', { timeout: 50000 });
  await page.locator('.sw-property-val[aria-label="Plant Code for PCN"]').click();
  await page.waitForSelector(`.sw-cell-valName[title="${selected_plant}"]`, { timeout: 50000 });
  await page.locator(`.sw-cell-valName[title="${selected_plant}"]`).click();
  await page.waitForTimeout(500);
  await page.waitForSelector(`.sw-changed[title="${selected_plant}"]`, { timeout: 50000 });
  await page.locator('textarea.sw-property-val[name="d4_PCN_ID"]').fill('1234567');
  await page.waitForTimeout(500);
  await page.locator('button.aw-commandId-Awp0EditGroup').click();
  await page.waitForSelector('.aw-widgets-cellListItem[aria-label="Save Edits"]', { timeout: 50000 });
  await page.locator('.aw-widgets-cellListItem[aria-label="Save Edits"]').click();
  await page.waitForTimeout(500);
  const workflowSteps = [ 'Complete', 'Complete', 'Completed', decision, 'Email LC', 'Complete', 'Complete', 'Approve', 'Approve', 'Approve', 'Complete' ];
  for (const step of workflowSteps) {
    await page.locator('.flex-wrap > button.sw-button', { hasText: step }).click();
    await page.waitForTimeout(8000);
    await page.reload();
  }
  await page.locator('.aw-commandId-Awp0NewGroup').click();
  await page.locator('.aw-widgets-cellListItem[command-id="Cm1ShowDeriveChange"]').click();
  await page.locator('.sw-property-val[name="REF(revision,D4_ChangeOrderRevisionCreI).d4_ReasonForChange"]').fill(reason);
  await page.locator('.justify-right > button.sw-button', { hasText: 'Derive' }).click();
  await page.locator('.flex-wrap > button.sw-button', { hasText: 'Complete' }).click();
  return { ID, selected_priority, selected_impact, selected_plant, decision };
}
