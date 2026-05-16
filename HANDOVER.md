# QA Portal — Handover Documentation

**Status:** Deployment workflow exists, but AWS OIDC authentication must be fixed before the workflow can deploy.

**Date:** 2026-05-16  
**Owner:** lngqaza  
**Repository:** https://github.com/lngqaza/sanlamconnect-qa-portal

---

## What's Complete

✅ **Repository Setup**
- GitHub repo created: `sanlamconnect-qa-portal`
- All code pushed to main branch
- Repository secret configured: `API_BASE_URL = https://api-qa-portal.eu-west-1.amazonaws.com`

✅ **Code Structure**
- Frontend: React 18 SPA with TypeScript (src/App.tsx)
- Backend: 5 Lambda functions (test executor, status, logs, history, report generator)
- Infrastructure: CloudFormation template for AWS resources
- CI/CD: GitHub Actions workflow for automated deployment

✅ **Git Configuration**
- Local repo: `/c/Users/e1000836/Desktop/sanlamconnect-qa-portal`
- Remote: `https://github.com/lngqaza/sanlamconnect-qa-portal.git`
- Branch: `main`
- Commit: `867ec5f` (Initial QA Portal commit)

---

## What's Pending

❌ **GitHub Actions AWS Authentication**
- Workflow file: `.github/workflows/deploy-qa-portal.yml` exists in the repo.
- Current failure: `Not authorized to perform sts:AssumeRoleWithWebIdentity`.
- AWS account `684756697968` does not currently expose a `github-actions-deploy` role to this handover session.
- Fix: create or repair the GitHub OIDC role using `infrastructure/github-actions-oidc-role.yml`, then rerun the workflow.

❌ **AWS Deployment**
- CloudFormation stack not yet deployed
- Requires GitHub Actions OIDC auth to succeed
- Stack name: `sanlamconnect-qa-portal-dev`
- Region: `eu-west-1`

---

## Next Steps (Priority Order)

### 1. Create or Repair GitHub Actions OIDC Role (5 min)
Run this once from an AWS principal with IAM and CloudFormation permissions:
```bash
aws cloudformation deploy \
  --template-file infrastructure/github-actions-oidc-role.yml \
  --stack-name sanlamconnect-qa-portal-github-oidc \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-west-1
```

If the AWS account already has a GitHub OIDC provider, pass it instead of creating a duplicate:
```bash
aws cloudformation deploy \
  --template-file infrastructure/github-actions-oidc-role.yml \
  --stack-name sanlamconnect-qa-portal-github-oidc \
  --parameter-overrides ExistingOidcProviderArn=arn:aws:iam::684756697968:oidc-provider/token.actions.githubusercontent.com \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-west-1
```

Expected output role:
```
arn:aws:iam::684756697968:role/github-actions-deploy
```

If the role already exists, verify its trust policy allows:
```text
repo:lngqaza/sanlamconnect-qa-portal:ref:refs/heads/main
```

### 2. Verify Workflow Appears (1 min)
```
URL: https://github.com/lngqaza/sanlamconnect-qa-portal/actions
Expected: See "Deploy QA Portal" workflow in list
```

### 3. Manual Workflow Trigger (2 min)
```
Click: "Deploy QA Portal" workflow
Click: "Run workflow" button
Select: environment = "dev"
Click: "Run workflow"
```

### 4. Monitor Deployment (10 min)
```
Watch workflow run in Actions tab
Expected time: ~10 minutes
Check for: ✅ Success or ❌ Failure
```

### 5. Get Dashboard URL (1 min)
```
In workflow run:
Find: "Post deployment summary" step
Copy: Dashboard URL (CloudFront domain)
Format: https://[cloudfront-id].cloudfront.net/
```

### 6. Test Dashboard (5 min)
```
Open dashboard URL in browser
Expected: React SPA with test controls
Test: Select mode + suites + click Execute
Expected: Queue test run, get run_id, polling starts
```

---

## Troubleshooting

### STS AssumeRoleWithWebIdentity Failure

**Symptom:** Workflow fails at "Configure AWS Credentials":
```text
Error: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

**Solution:**
1. Confirm role exists:
   ```bash
   aws iam get-role --role-name github-actions-deploy
   ```
2. If missing, deploy `infrastructure/github-actions-oidc-role.yml`.
3. Confirm the role trust policy allows GitHub OIDC subject:
   ```text
   repo:lngqaza/sanlamconnect-qa-portal:ref:refs/heads/main
   ```
4. Confirm workflow has:
   ```yaml
   permissions:
     id-token: write
     contents: read
   ```

### AWS SDK for JavaScript v2 Warning

**Symptom:** Workflow logs show:
```text
Please migrate your code to use AWS SDK for JavaScript (v3).
```

**Status:** The repo does not use the JavaScript AWS SDK directly. The warning came from older GitHub Actions dependencies. The workflow has been updated to current actions, including `aws-actions/configure-aws-credentials@v4`.

### Workflow Fails During Execution

**Check logs:**
1. Click failed workflow run
2. Expand failed step
3. Read error message
4. Common issues:
   - AWS credentials not configured (OIDC role issue)
   - Node.js/Python version mismatch
   - Missing CloudFormation permissions

**Re-run:** Click "Re-run failed jobs" button

### CloudFormation Stack Creation Fails

**Check AWS Console:**
```bash
aws cloudformation describe-stacks \
  --stack-name sanlamconnect-qa-portal-dev \
  --region eu-west-1 \
  --query 'Stacks[0].StackStatus'
```

**View events:**
```bash
aws cloudformation describe-stack-events \
  --stack-name sanlamconnect-qa-portal-dev \
  --region eu-west-1
```

### Dashboard Not Loading After Deployment

**Check S3:**
```bash
aws s3 ls s3://sanlamconnect-qa-portal-684756697968-dev/ --recursive
```

**Check CloudFront:**
```bash
aws cloudfront list-distributions \
  --query 'DistributionList.Items[?StackId==`sanlamconnect-qa-portal-dev`]'
```

---

## Repository Structure

```
sanlamconnect-qa-portal/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          (React dashboard, 350 lines)
│   │   └── App.css          (Tailwind styles)
│   ├── public/
│   │   └── index.html       (React entry point)
│   └── package.json         (Dependencies)
│
├── backend/
│   ├── lambda_handler.py    (test_executor_handler, 50 lines)
│   ├── api_functions.py     (Status/logs/history/report endpoints, 230 lines)
│   ├── dynamodb_service.py  (DynamoDB CRUD operations, 90 lines)
│   └── requirements.txt     (boto3, reportlab, pillow, jinja2, etc.)
│
├── infrastructure/
│   ├── github-actions-oidc-role.yml  (GitHub OIDC deploy role)
│   └── qa-portal-infrastructure.yml  (CloudFormation)
│
├── .github/
│   └── workflows/
│       └── deploy-qa-portal.yml     (GitHub Actions CI/CD, 170 lines)
│
├── .gitignore
├── README.md
├── HANDOVER.md              (This file)
└── DEPLOYMENT_GUIDE.md      (Operations manual)
```

---

## Key Information

**AWS Account:** 684756697968  
**Region:** eu-west-1  
**Environment:** dev (also supports staging, production)

**GitHub Secrets:**
- `API_BASE_URL` is no longer required by the deployment workflow. The workflow reads the API Gateway URL from CloudFormation outputs before building the React app.
- `SLACK_WEBHOOK_URL` is optional. Slack notification is skipped when it is absent.

**AWS Resources (to be created by CloudFormation):**
- API Gateway REST API
- Lambda functions (5)
- DynamoDB tables (2)
- S3 bucket
- CloudFront distribution
- CloudWatch Logs group
- IAM execution role

**Cost Estimate:** ~$3.25/month (dev)

---

## Deployment Environments

The workflow supports 3 environments:

1. **dev** — Development, full testing
   - Stack name: `sanlamconnect-qa-portal-dev`
   - URL: CloudFront domain
   
2. **staging** — Pre-production testing
   - Stack name: `sanlamconnect-qa-portal-staging`
   
3. **production** — Live environment
   - Stack name: `sanlamconnect-qa-portal-production`

Select environment when running workflow.

---

## Testing the System

Once deployed, test the QA Portal:

1. Open dashboard URL
2. Select test mode: `mock` (fastest, no AWS calls)
3. Check test suites: `alarms`, `reports`
4. Click "Execute Tests"
5. Wait for results (should complete in 5 min for mock mode)
6. Click "Generate Report" → Download HTML

Expected: 
- Test results show passed/failed/skipped counts
- HTML report downloads successfully
- Dashboard responsive and fast

---

## Important Notes

**Separate from Cashflow Project:**
- This QA Portal repo is INDEPENDENT from sanlam-cashflow
- Do NOT commit code to sanlam-cashflow repo
- Maintain strict separation

**Purpose:**
- Validate Dynatrace monitoring subsystem
- Test financial calculator integration
- Generate compliance/audit reports
- Track test history and trends

**Not a QA Environment:**
- QA Portal = Testing Dashboard Tool
- It RUNS IN a QA environment, but it's not the QA environment itself
- It's a product that gets promoted Dev → QA → Prod

---

## Contact & Support

For issues:
1. Check CloudWatch Logs: `/qa-portal/test-runs/dev`
2. Check CloudFormation events: AWS Console → CloudFormation → Stack
3. Review GitHub Actions workflow logs
4. Check this HANDOVER.md for troubleshooting section

---

**Last Updated:** 2026-05-16 15:00 UTC
**Status:** Blocked on GitHub Actions OIDC role creation/repair
**Next Owner:** Codex / Deployment Team
