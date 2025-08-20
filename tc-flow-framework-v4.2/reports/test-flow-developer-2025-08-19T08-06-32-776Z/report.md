# Run Report**Flow**: test-flow-developer**Generated**: 8/19/2025, 4:11:05 PM## Steps- **login** — PASSED (2025-08-19T08:06:32.779Z -> 2025-08-19T08:06:37.466Z)  - Screenshot: screenshots/login.png  - Meta:```json{
  "username": "xingyl4"
}```- **01-advancedSearch** — PASSED (2025-08-19T08:06:37.574Z -> 2025-08-19T08:06:55.837Z)  - Screenshot: screenshots/01-advancedSearch.png  - Meta:```json{
  "search_id": "6000064127",
  "advanced_query_type": "Item Revision...",
  "search_type": "Item Revision"
}```- **02-createMechDesign** — PASSED (2025-08-19T08:06:56.013Z -> 2025-08-19T08:07:49.807Z)  - Screenshot: screenshots/02-createMechDesign.png  - Meta:```json{
  "created_id": "3016980044",
  "name": "Demo MD"
}```- **03-createProductPart** — PASSED (2025-08-19T08:07:50.126Z -> 2025-08-19T08:08:35.791Z)  - Screenshot: screenshots/03-createProductPart.png  - Meta:```json{
  "created_id": "3016980045",
  "ITEM_NAME": "PP-01"
}```- **04-saveAs** — PASSED (2025-08-19T08:08:35.926Z -> 2025-08-19T08:09:03.899Z)  - Screenshot: screenshots/04-saveAs.png  - Meta:```json{
  "created_id": "3016980046",
  "NAME": "MD-Copy"
}```- **05-createChanges** — PASSED (2025-08-19T08:09:04.016Z -> 2025-08-19T08:09:35.462Z)  - Screenshot: screenshots/05-createChanges.png  - Meta:```json{
  "CR_number": "CR-000003863"
}```- **06-submitWorkflow** — FAILED (2025-08-19T08:09:35.738Z -> 2025-08-19T08:11:04.996Z)  - Error: `page.waitForSelector: Timeout 40000ms exceeded.
Call log:
[2m  - waiting for locator('.noty_message > .noty_text') to be visible[22m

    at submitWorkflow (C:\document\AutoTest\tc-flow-framework-v4.2\src\steps\step-submit-workflow.ts:37:14)
    at async runStep (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\flow.ts:66:10)
    at async withRetry (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\retry.ts:12:14)
    at async runFlow (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\flow.ts:203:24)
    at async <anonymous> (C:\document\AutoTest\tc-flow-framework-v4.2\src\main.ts:9:3)`  - Screenshot: screenshots/06-submitWorkflow.png