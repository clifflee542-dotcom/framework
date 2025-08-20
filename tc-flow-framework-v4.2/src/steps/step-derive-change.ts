import { Page } from 'playwright';
import { ask } from '../utils.js';
export async function deriveChange(page: Page) {
  const ID = await ask('deriveChange.item_id', 'Enter item id: ');
  await page.locator('.aw-commandId-Awp0NewGroup').click();
  await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 20000 });
  await page.locator(`div.aw-splm-tableCellText[title="${ID}"]`, { hasText: ID }).first().click();
  await page.locator('.aw-widgets-cellListItem[command-id="Cm1ShowDeriveChange"]').click();
  await page.locator('.sw-property-val[name="REF(revision,D4_ChangeOrderRevisionCreI).d4_ReasonForChange"]').fill('Reason for change goes here');
  await page.locator('.justify-right > button.sw-button', { hasText: 'Derive' }).click();
  return { ID };
}
