import { Page } from 'playwright';
import { selectFromList, yesNoPrompt, ask, SAP_DOC_TYPES, SUBTYPE_MAP, MOLEX_RESTRICTION } from '../utils.js';
export async function createMechDesign(page: Page) {
  const document_type = await selectFromList('createMechDesign.document_type', 'Select Document Type:', Object.keys(SUBTYPE_MAP));
  const document_subtype = await selectFromList('createMechDesign.document_subtype', `Select Document Subtype for ${document_type}:`, SUBTYPE_MAP[document_type]);
  const sap_doc_type = await selectFromList('createMechDesign.sap_doc_type', 'Select SAP Document Type:', SAP_DOC_TYPES);
  const molex_restriction = await selectFromList('createMechDesign.molex_restriction', 'Select Molex Restriction:', MOLEX_RESTRICTION);
  const name = (await ask('createMechDesign.name', '\nEnter Name: ')).trim();
  const molex_checked = await yesNoPrompt('createMechDesign.enable_molex_series', 'Enable Molex Series?');
  const series_number = molex_checked ? (await ask('createMechDesign.series_number', 'Enter Series Number: ')).trim() : '';
  const RPM_NUMBER = (await ask('createMechDesign.rpm_number', 'Enter RPM attachment number: ')).trim();
  console.log('Executing create mechdesign...');
  await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 20000 });
  await page.waitForSelector('div.sw-sectionTitle[title="Properties"]', { timeout: 20000 });
  await page.locator('.aw-commandId-Awp0NewGroup').click();
  await page.locator('.aw-widgets-cellListItem[command-id="Awp0ShowCreateObject"]').click();
  await page.locator('ul > li[aria-label="Mechanical Design"]:nth-child(n+5) > .sw-aria-border > .sw-row').click();
  await page.locator('input.sw-property-val[data-locator="Document Type"]').click();
  await page.locator(`ul > li[aria-label="${document_type}"] > .sw-aria-border > .sw-row`).click();
  await page.waitForTimeout(1000);
  await page.locator('input.sw-property-val[data-locator="Document Subtype"]').click();
  await page.getByRole('option', { name: document_subtype }).click();
  await page.waitForTimeout(1000);
  await page.locator('input.sw-property-val[data-locator="SAP Document Type"]').click();
  await page.waitForSelector(`ul > li[aria-label="${sap_doc_type}"]`, { timeout: 50000 });
  await page.locator(`ul > li[aria-label="${sap_doc_type}"] > .sw-aria-border > .sw-row`).click();
  await page.locator('input.sw-property-val[data-locator="SAP Document Part"]').fill('000');
  await page.locator('input.sw-aria-border[data-locator="Molex.com Restriction"]').click();
  await page.waitForSelector(`ul > li[aria-label="${molex_restriction}"]`, { timeout: 50000 });
  await page.locator(`ul > li[aria-label="${molex_restriction}"] > .sw-aria-border > .sw-row`).click();
  await page.locator('textarea.sw-property-val[name="object_name"]').fill(name);
  if (!molex_checked) {
    await page.evaluate(() => {
      const checkbox = document.querySelector<HTMLInputElement>('input[name="d4_Confirm_Info"]');
      if (checkbox && checkbox.checked) checkbox.click();
    });
  } else {
    await page.locator('textarea.sw-property-val[data-locator="Series"]').fill(series_number);
  }
  await page.locator('.flex-wrap > button.sw-button').click();
  await page.waitForSelector('.noty_message > .noty_text', { timeout: 50000 });
  await page.waitForSelector('.noty_message > .noty_text', { state: 'detached', timeout: 50000 });
  let created_id = '';
  try {
    await page.waitForSelector('span.sw-property-val[data-locator="ID"]', { timeout: 50000 });
    created_id = await page.locator('span.sw-property-val[data-locator="ID"]').innerText();
    console.log('\n✅ Component Created Successfully:');
    console.log(`ID : ${created_id}`);
    console.log(`Name : ${name}`);
  } catch (e) {
    console.log('\n⚠️ Could not retrieve component info.');
    console.log(`Error: ${e}`);
  }
  // RPM attachment logic
  await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  await page.locator('.aw-search-fullModeSearchIconViewContainer[role="button"]').first().click();
  await page.locator('.sw-widget-iconContainer[aria-label="selectPrefilter2"]').click();
  await page.locator('.sw-cell-valName[title="RPM"]').click();
  await page.locator('input.aw-uiwidgets-searchBox[name="searchBox"]').fill(RPM_NUMBER);
  await page.waitForTimeout(2000);
  await page.keyboard.press('Enter');
  await page.waitForSelector('a.sw-tab-selected[aria-label="Overview"]').then(()=>page.locator('.aw-commandId-Awp0Copy[aria-label="Copy"]').click());
  await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  await page.locator('div.aw-splm-tableHeaderCellLabel.aw-splm-tableHeaderCellInner', { hasText: 'Item Id' }).waitFor({ timeout: 20000 });
  await page.waitForSelector('div.sw-sectionTitle[title="Properties"]', { timeout: 20000 });
  if (created_id) {
    await page.locator(`div.aw-splm-tableCellText[title="${created_id}"]`, { hasText: created_id }).first().click();
    await page.locator('.sw-row[aria-label="References"]').click();
    await page.locator('.align-self-stretch[caption="RPM Attachments"] button[aria-label="Paste"]').click();
    await page.locator('.aw-commandId-Awp0ShowHomeFolder').click();
  }
  return { created_id, name };
}
