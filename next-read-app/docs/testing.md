# Testing

NexRead uses two complementary test layers:

- Vitest and React Testing Library (RTL) for fast unit and component tests.
- Playwright for browser-level end-to-end (E2E) smoke tests.

## Commands

Run the fast unit and component suite:

```bash
npm test
```

Run the suite interactively while developing:

```bash
npm run test:watch
```

Generate unit/component coverage:

```bash
npm run test:coverage
```

Run E2E tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright reuses a local app on port `3000`, or starts one automatically when
none is running. Set
`PLAYWRIGHT_BASE_URL` when testing an already-running deployed environment.

## Reports

`npm run test:coverage` creates these local-only artifacts:

- `coverage/index.html`: interactive HTML coverage report.
- `coverage/lcov.info`: coverage input for CI services.
- terminal output: per-file coverage summary.

Playwright creates:

- `playwright-report/index.html`: HTML browser test report.
- `test-results/`: traces and screenshots for failed tests.

Open the latest Playwright report with:

```bash
npm run test:e2e:report
```

Reports are ignored by Git. GitHub Actions uploads them when a test job fails,
so failures remain inspectable without adding generated files to the repository.

## Scope and Conventions

Use Vitest for deterministic logic, API response mapping, validation, and
component states. Mock network calls in component tests; do not call the
staging backend from this layer.

Use Playwright for critical user journeys and routing. Keep public smoke tests
independent of staging data. Authenticated or destructive E2E tests must use
dedicated test accounts and isolated data before being added to CI.

Current baseline coverage tests role authorization, error-message handling, and
admin navigation. The E2E baseline verifies that the login form is reachable
and accessible in Chromium.
