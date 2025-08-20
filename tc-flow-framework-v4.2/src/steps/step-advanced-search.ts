import { Page } from 'playwright';
import { selectFromList, ask } from '../utils.js';
const ADVANCED_QUERY_TYPE = ["Item Revision...", "Item..."];
const SEARCH_TYPE = ["Item Revision", "Change Order Revision", "Change Request Revision", "RPM"];
export async function advancedSearch(page: Page) {
  const search_id = await ask('advancedSearch.search_id', 'Enter item id: ');
  const advanced_query_type = await selectFromList('advancedSearch.advanced_query_type', 'Select Advanced Query Type:', ADVANCED_QUERY_TYPE, 2);
  const search_type = await selectFromList('advancedSearch.search_type', 'Select Type:', SEARCH_TYPE, 4);
  console.log('Executing advanced search...');
  await page.locator('.aw-commandId-Awp0GoHome[tabindex="0"]').first().click();
  await page.locator('.aw-tile-iconContainer > span.aw-icon[iconid="homeAdvancedSearch"]').click();
  await page.locator('input.sw-aria-border[data-locator="Advanced Query Name"]').click();
  await page.locator('input.sw-aria-border[data-locator="Advanced Query Name"]').scrollIntoViewIfNeeded();
  await page.locator('input.sw-aria-border[data-locator="Advanced Query Name"]').fill(advanced_query_type);
  await page.locator('input.sw-aria-border[data-locator="Advanced Query Name"]').click();
  await page.locator(`.sw-cell-valName[title="${advanced_query_type}"]`).click();
  await page.waitForTimeout(2000);
  await page.click('a[aria-label="Clear All"]');
  await page.evaluate(() => {
    const el = document.querySelector('a[aria-label="Clear All"]');
    if (el) ['mouseover','mousedown','mouseup','click'].forEach(t=>el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window })));
  });
  // await page.locator('input.sw-aria-border[data-locator="Type"]').click();
  // await page.locator('input.sw-aria-border[data-locator="Type"]').fill(search_type);
  // await page.locator('input.sw-aria-border[data-locator="Type"]').click();
  // await page.locator(`.sw-cell-valName[title="${search_type}"]`).click();
  await page.locator('.sw-property-val[aria-label="Item ID"]').fill(search_id);
  await page.locator('.aw-panel-footer > button.sw-button').click();
  await page.waitForSelector('.sw-sectionTitle[title="IDENTIFICATION DATA"]', { timeout: 30000 });
  return { search_id, advanced_query_type, search_type };
}
