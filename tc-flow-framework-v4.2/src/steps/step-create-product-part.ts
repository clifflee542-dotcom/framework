import { Page } from 'playwright';
import { ask } from '../utils.js';
export async function createProductPart(page: Page) {
  const ITEM_NAME = await ask('createProductPart.item_name', 'Enter item name: ');
  const default_checked = (await ask('createProductPart.create_series', 'Create Molex Series? 1-Yes 2-No: ')) === '1';
  let SERIES_NUMBER = '';
  if (default_checked) SERIES_NUMBER = await ask('createProductPart.series_number', 'Enter Series Number: ');
  const RPM_NUMBER = await ask('createProductPart.rpm_number', 'Enter RPM attachment number: ');
  console.log('Executing create productpart...');
  await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 50000 });
  await page.waitForSelector('div.sw-sectionTitle[title="Properties"]', { timeout: 50000 });
  await page.locator('.aw-commandId-Awp0NewGroup').click();
  await page.locator('.aw-widgets-cellListItem[command-id="Awp0ShowCreateObject"]').click();
  await page.locator('ul > li[aria-label="Product Part"]:nth-child(n+5) > .sw-aria-border > .sw-row').click();
  await page.waitForTimeout(2000);
  await page.locator('textarea.sw-property-val[name="object_name"]').fill(ITEM_NAME);
  if (!default_checked) {
    await page.evaluate(() => {
      const checkbox = document.querySelector<HTMLInputElement>('input[name="d4_Confirm_Info"]');
      if (checkbox && checkbox.checked) checkbox.click();
    });
  }
  if (default_checked) {
    await page.locator('textarea.sw-property-val[aria-label="Series"]').fill(SERIES_NUMBER);
  }
  await page.locator('.flex-wrap > button.sw-button').click();
  await page.waitForSelector('.noty_message > .noty_text', { timeout: 50000 });
  await page.waitForSelector('.noty_message > .noty_text', { state: 'detached', timeout: 50000 });
  try {
    await page.waitForSelector('span.sw-property-val[data-locator="ID"]', { timeout: 50000 });
    const created_id = await page.locator('span.sw-property-val[data-locator="ID"]').innerText();
    console.log('\n✅ Component Created Successfully:');
    console.log(`ID : ${created_id}`);
    console.log(`Name : ${ITEM_NAME}`);
    //global search
    await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
    await page.locator('.aw-search-fullModeSearchIconViewContainer[role="button"]').first().click();
    await page.locator('.sw-widget-iconContainer[aria-label="selectPrefilter2"]').click();
    await page.locator('.sw-cell-valName[title="RPM"]').click();
    await page.locator('input.aw-uiwidgets-searchBox[name="searchBox"]').fill(RPM_NUMBER);
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForSelector('a.sw-tab-selected[aria-label="Overview"]').then(()=>page.locator('.aw-commandId-Awp0Copy[aria-label="Copy"]').click());
    await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
    await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 50000 });
    await page.locator(`div.aw-splm-tableCellText[title="${created_id}"]`, { hasText: created_id }).first().click();
    await page.locator('.sw-row[aria-label="References"]').click();
    await page.locator('.align-self-stretch[caption="RPM Attachments"] > div > div > div > div > div > div > div > div > button[aria-label="Paste"]').click();
    return { created_id, ITEM_NAME };
  } catch (e) {
    console.log('\n⚠️ Could not retrieve component info. Please check the UI selectors.');
    console.log(`Error: ${e}`);
    return {};
  }
}
