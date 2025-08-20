# Run Report**Flow**: test-flow-developer**Generated**: 8/19/2025, 3:55:24 PM## Steps- **login** — PASSED (2025-08-19T07:53:04.299Z -> 2025-08-19T07:53:08.763Z)  - Screenshot: screenshots/login.png  - Meta:```json{
  "username": "xingyl4"
}```- **01-advancedSearch** — PASSED (2025-08-19T07:53:08.870Z -> 2025-08-19T07:53:24.645Z)  - Screenshot: screenshots/01-advancedSearch.png  - Meta:```json{
  "search_id": "6000064127",
  "advanced_query_type": "Item Revision...",
  "search_type": "Item Revision"
}```- **02-createMechDesign** — PASSED (2025-08-19T07:53:24.819Z -> 2025-08-19T07:54:13.822Z)  - Screenshot: screenshots/02-createMechDesign.png  - Meta:```json{
  "created_id": "3016980038",
  "name": "Demo MD"
}```- **03-createProductPart** — PASSED (2025-08-19T07:54:14.159Z -> 2025-08-19T07:54:54.404Z)  - Screenshot: screenshots/03-createProductPart.png  - Meta:```json{
  "created_id": "3016980039",
  "ITEM_NAME": "PP-01"
}```- **04-saveAs** — FAILED (2025-08-19T07:54:54.510Z -> 2025-08-19T07:55:24.625Z)  - Error: `locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('div.aw-splm-tableCellText[title="3016980037"]').first()[22m

    at navigateToSaveAs (C:\document\AutoTest\tc-flow-framework-v4.2\src\steps\step-save-as.ts:51:81)
    at async saveAs (C:\document\AutoTest\tc-flow-framework-v4.2\src\steps\step-save-as.ts:19:3)
    at async runStep (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\flow.ts:66:10)
    at async withRetry (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\retry.ts:12:14)
    at async runFlow (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\flow.ts:203:24)
    at async <anonymous> (C:\document\AutoTest\tc-flow-framework-v4.2\src\main.ts:9:3)`  - Screenshot: screenshots/04-saveAs.png