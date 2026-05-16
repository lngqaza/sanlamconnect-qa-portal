# SanlamConnect QA Portal

**Dynatrace Monitoring Validation & Test Execution Dashboard**

Quality Assurance platform for validating the monitoring and performance subsystem. Execute tests on-demand from a web dashboard, view live results, generate compliance reports, and track test history.

## Features

- 🚀 **Test Execution Dashboard** — Execute tests from browser UI
- 📊 **Live Results Monitoring** — Real-time test status and progress tracking
- 📈 **Test History** — Browse and manage past test runs
- 📄 **Report Generation** — Download HTML/PDF compliance reports
- 🔄 **Multi-Mode Testing** — dry-run, mock, and live integration modes
- ☁️ **AWS-Native** — Fully serverless (Lambda, API Gateway, DynamoDB, S3, CloudFront)

## Architecture

```
React SPA (S3 + CloudFront)
    ↓ HTTPS/REST
API Gateway (Regional)
    ↓
Lambda Functions (5)
    ├─ test_executor: Queue test runs
    ├─ test_status: Poll test status
    ├─ test_logs: Stream CloudWatch logs
    ├─ test_history: List past runs
    └─ report_generator: Generate PDF/HTML
    ↓
Data Layer
    ├─ DynamoDB TestRuns (run_id + created_at)
    ├─ DynamoDB TestReports (report_id)
    ├─ CloudWatch Logs (/qa-portal/test-runs/)
    └─ S3 (dashboard + reports)
```

## Deployment

### Dev Environment

```bash
git push origin main
# GitHub Actions triggers automatically on push
# OR manually trigger workflow:
# GitHub > Actions > "Deploy QA Portal" > "Run workflow" > Select "dev"
```

### Staging/Production

Same workflow, select environment during manual trigger.

**Deployment time:** ~10 minutes

## Local Development

```bash
# Frontend
cd frontend
npm install
npm start
# Opens http://localhost:3000

# Backend (requires AWS credentials)
cd backend
pip install -r requirements.txt
# Run tests locally with: python -m pytest
```

## Environment Variables

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:3001  # Dev
REACT_APP_API_URL=https://api-qa-portal.eu-west-1.amazonaws.com  # Prod
```

**Backend (.env / Lambda environment):**
```
AWS_REGION=eu-west-1
TEST_RUNS_TABLE=qa-portal-test-runs-dev
TEST_REPORTS_TABLE=qa-portal-test-reports-dev
LOG_GROUP=/qa-portal/test-runs/dev
S3_BUCKET=sanlamconnect-qa-portal-684756697968-dev
```

## Test Execution

### Modes

- **dry-run** — Syntax validation only (2 min, no AWS calls)
- **mock** — Logic validation with mock data (5 min)
- **live** — Full integration testing (45 min, real AWS/Dynatrace)

### Test Suites

1. CloudWatch Alarms — Trigger 5 test alarms
2. Financial Calculator — Validate cost calculations
3. Dashboard Refresh — Verify KPI injection
4. Scheduled Reports — Generate test reports
5. Exception Monitoring — Threshold detection
6. Self-Healing — Circuit-breaker and recovery
7. Alarm Notifications — SNS → Slack delivery
8. Data Consistency — Cross-system validation

## Monitoring

**Dashboard URL:** `https://qa-portal.sanlamconnect.com` (CloudFront)

**API Base:** `https://api-qa-portal.eu-west-1.amazonaws.com/`

**Logs:** `aws logs tail /qa-portal/test-runs/dev --follow`

**Costs:** ~$3.25/month (dev) with auto-cleanup via DynamoDB TTL

## Troubleshooting

**Dashboard not loading:**
```bash
aws cloudformation describe-stacks \
  --stack-name sanlamconnect-qa-portal-dev \
  --region eu-west-1
```

**API endpoints returning 500:**
```bash
aws logs tail /aws/lambda/qa-portal-test-executor-dev --follow
```

**Tests not persisting:**
```bash
aws dynamodb describe-table \
  --table-name qa-portal-test-runs-dev \
  --region eu-west-1
```

## Repository Structure

```
sanlamconnect-qa-portal/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          (React dashboard component)
│   │   └── App.css          (Styling)
│   ├── public/
│   │   └── index.html       (Entry point)
│   └── package.json         (Dependencies)
├── backend/
│   ├── lambda_handler.py    (Test executor)
│   ├── api_functions.py     (Status, logs, history, reports)
│   ├── dynamodb_service.py  (DynamoDB operations)
│   └── requirements.txt     (Python deps)
├── infrastructure/
│   └── qa-portal-infrastructure.yml  (CloudFormation)
├── .github/
│   └── workflows/
│       └── deploy-qa-portal.yml     (CI/CD)
└── README.md                (This file)
```

## Team

Built for SanlamConnect LXP platform validation and monitoring subsystem QA.

**Questions?** Check CloudWatch logs or CloudFormation events tab for deployment issues.
