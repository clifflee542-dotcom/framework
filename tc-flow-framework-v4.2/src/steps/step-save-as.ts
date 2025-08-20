import { Page } from 'playwright';
import { ask,Search_Type } from '../utils.js';
export async function saveAs(page: Page) {
  const dataSourceChoice = await ask('saveAs.source', 'Select data source for Save As: 1-Local 2-Repository: ');
  const ITEM_ID = await ask('saveAs.item_id', 'Enter item id: ');
  const idxStr = await ask('saveAs.search_type', 'Enter the number of the type: ');
  const idx = parseInt(idxStr, 10);
  const search_TYPE = Search_Type[idx-1] || Search_Type[0];
  let NAME = '';
  let series_number = '';
  console.log('Executing save as...');

  if (idx === 11 || idx === 15) {
    NAME = await ask('saveAs.new_name', 'Enter new name: ');
    const molex_choice = await ask('saveAs.molex_series', 'Enable Molex Series? 1-Yes 2-No: ');
    const molex_checked = molex_choice === '1';
    if (molex_checked) series_number = await ask('saveAs.series_number', 'Enter Series Number: ');
  }
  await navigateToSaveAs(page, dataSourceChoice, ITEM_ID, search_TYPE);
  if (idx === 11 || idx === 15) {
    if (series_number) {
      await page.locator('textarea.sw-property-val[data-locator="Series"]').fill(series_number);
    } else {
      await page.evaluate(() => {
        const checkbox = document.querySelector<HTMLInputElement>('input[name="REF(items_tag,D4_PartSvAI).d4_Confirm_Info"]');
        if (checkbox && checkbox.checked) checkbox.click();
      });
    }
    await page.locator('textarea.sw-property-val[name="object_name"]').clear();
    await page.locator('textarea.sw-property-val[name="object_name"]').fill(NAME);
  }
  await page.locator('.aw-panel-footer > button.sw-button').click();
  await page.waitForSelector('.noty_message > .noty_text', { timeout: 50000 });
  await page.waitForSelector('.noty_message > .noty_text', { state: 'detached', timeout: 50000 });
  try {
    await page.waitForSelector('span.sw-property-val[data-locator="ID"]', { timeout: 30000 });
    const created_id = await page.locator('span.sw-property-val[data-locator="ID"]').innerText();
    console.log('\n✅ Component Created Successfully:');
    console.log(`ID : ${created_id}`);
    if (idx === 11 || idx === 15) console.log(`Name : ${NAME}`);
    return { created_id, NAME };
  } catch (e) {
    console.log('\n⚠️ Could not retrieve component info. Please check the UI selectors.');
    console.log(`Error: ${e}`);
    return {};
  }
}
async function navigateToSaveAs(page: Page, dataSourceChoice: string, ITEM_ID: string, search_TYPE: string) {
  await page.locator('.aw-commandId-Awp0GoHome[tabindex="0"]').first().click();
  await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  if (dataSourceChoice === '1') {
    await page.locator(`div.aw-splm-tableCellText[title="${ITEM_ID}"]`).first().click();
    await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 30000 });
  } else {
    await page.locator('.aw-search-fullModeSearchIconViewContainer[role="button"]').first().click();
    await page.locator('.sw-widget-iconContainer[aria-label="selectPrefilter2"]').click();
    await page.locator(`.sw-cell-valName[title="${search_TYPE}"]`).click();
    await page.locator('input.aw-uiwidgets-searchBox[name="searchBox"]').fill(ITEM_ID);
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
  }
  await page.waitForSelector('.sw-sectionTitle[title="IDENTIFICATION DATA"]', { timeout: 50000 });
  await page.locator('.aw-commandId-Awp0NewGroup').click();
  await page.locator('.aw-widget-thumbnail[icon-id="cmdSaveAs"]').click();
  await page.waitForTimeout(2000);
}
