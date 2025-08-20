# Run Report**Flow**: test-flow-developer**Generated**: 8/19/2025, 4:30:01 PM## Steps- **login** — PASSED (2025-08-19T08:28:36.003Z -> 2025-08-19T08:28:40.479Z)  - Screenshot: screenshots/login.png  - Meta:```json{
  "username": "xingyl4"
}```- **01-submitWorkflow** — FAILED (2025-08-19T08:28:40.613Z -> 2025-08-19T08:30:01.340Z)  - Error: `page.waitForSelector: Timeout 40000ms exceeded.
Call log:
[2m  - waiting for locator('.noty_message > .noty_text') to be visible[22m

    at submitWorkflow (C:\document\AutoTest\tc-flow-framework-v4.2\src\steps\step-submit-workflow.ts:38:14)
    at async runStep (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\flow.ts:66:10)
    at async withRetry (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\retry.ts:12:14)
    at async runFlow (C:\document\AutoTest\tc-flow-framework-v4.2\src\core\flow.ts:203:24)
    at async <anonymous> (C:\document\AutoTest\tc-flow-framework-v4.2\src\main.ts:9:3)`  - Screenshot: screenshots/01-submitWorkflow.png