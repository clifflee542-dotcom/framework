import { Page } from 'playwright';
import { selectFromList, ask } from '../utils.js';
const WORKFLOW_TEMPLATES = ['Design Freeze','Design Approval Workflow','Buy or Make Workflow','Part Approval Workflow','Change_Request'];
export async function submitWorkflow(page: Page, username?: string) {
  const WORKFLOW_TEMPLATE = await selectFromList('submitWorkflow.template','Select Workflow Template:',WORKFLOW_TEMPLATES,1);
  const ID = await ask('submitWorkflow.item_id','Enter item id: ');
  const user = username || await ask('submitWorkflow.username', 'Enter username to add as participant: ');
  console.log('Executing submit workflow...');
  await page.locator('.aw-commandId-Awp0GoHome[tabindex="0"]').first().click();
  await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 40000 });
  await page.locator(`div.aw-splm-tableCellText[title="${ID}"]`, { hasText: ID }).first().click();
  if (WORKFLOW_TEMPLATE === 'Change_Request') {
    await page.waitForSelector('.sw-tab-title[aria-label="Participants"]');
    await page.locator('.sw-tab-title[aria-label="Participants"]').click();
  }
  for (let i=1;i<=6;i++) {
    await page.locator('button.aw-commandId-Awp0AddParticipant').nth(i).click();
    await page.waitForSelector('input.aw-uiwidgets-searchBox[placeholder="Find in this content"]', { timeout: 40000 });
    await page.locator('input.aw-uiwidgets-searchBox[placeholder="Find in this content"]').fill(user);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    await page.locator('button.sw-avatar-generic[data-locator="avatar-generic small"]').first().click();
    await page.waitForSelector('.flex-wrap > button.sw-button > div', { timeout: 40000 });
    await page.locator('.flex-wrap > button.sw-button > div').click();
    await page.locator('.aw-type-icon[alt="Object Set Row"]').nth(i).waitFor({ state: 'visible', timeout: 40000 });
  }
  await page.locator('.aw-commandId-Awp0ManageGroup').click();
  await page.locator('div > li[aria-label="Submit to Workflow"]').click();
  await page.waitForFunction(() => {
    const el = document.querySelector<HTMLInputElement>('input[data-locator="Template"]');
    return !!el && !!el.value && el.value.trim().length>0;
  });
  await page.locator('input.sw-aria-border[data-locator="Template"]').click();
  await page.waitForSelector(`.sw-cell-valName[title="${WORKFLOW_TEMPLATE}"]`, { timeout: 50000 });
  await page.locator(`.sw-cell-valName[title="${WORKFLOW_TEMPLATE}"]`).click();
  await page.waitForSelector('.flex-auto > button.sw-button', { timeout: 40000 });
  await page.locator('.flex-auto > button.sw-button').click();
  await page.waitForTimeout(5000);
  // await page.waitForSelector('.noty_message > .noty_text', { timeout: 40000 });
  // await page.waitForSelector('.noty_message > .noty_text', { state: 'detached', timeout: 40000 });
  await page.waitForSelector('.sw-tab-title[name="tc_xrt_Overview"]');
  await page.locator('.sw-tab-title[name="tc_xrt_Overview"]').click();
  return { ID, WORKFLOW_TEMPLATE };
}
