# QA Portal — Deployment & Access URLs

**Status:** Ready to Deploy (UI Enhanced ✨)  
**Current Commit:** dba9531 (Enhance QA Portal UI with modern dark theme)  
**Last Updated:** 2026-05-16

---

## 📍 Deployment URLs (Generated After Deploy)

Once deployed, you'll have access to these URLs:

### Development Environment

| Component | URL Template | Description |
|-----------|------------|-------------|
| **Dashboard (Portal)** | `https://d{RANDOM}.cloudfront.net/` | React SPA Dashboard (public, no auth) |
| **API Base** | `https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/` | REST API endpoints |
| **Test Execute** | `https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/test/execute` | POST endpoint to trigger tests |
| **Test Status** | `https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/test/{run_id}/status` | GET endpoint to check status |
| **Test Logs** | `https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/test/{run_id}/logs` | GET endpoint for logs |
| **Test History** | `https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/test/history` | GET endpoint for test history |

### AWS Resources (Direct Access)

| Resource | Location | Command to Get |
|----------|----------|-----------------|
| **S3 Bucket** | eu-west-1 | `aws s3 ls \| grep qa-portal` |
| **DynamoDB Tables** | eu-west-1 | `aws dynamodb list-tables --region eu-west-1` |
| **CloudFront Distribution** | Global | `aws cloudfront list-distributions --query 'DistributionList.Items[?Comment==\`QA Portal Dev\`]'` |
| **Lambda Functions** | eu-west-1 | `aws lambda list-functions --region eu-west-1 --query 'Functions[?contains(FunctionName,\`qa-portal\`)]'` |
| **CloudWatch Logs** | eu-west-1 | `/qa-portal/dev` (log group name) |

---

## 🚀 How to Get the URLs

### Step 1: Complete AWS Admin Setup (5 min)

Send the AWS admin these 3 commands from `AWS_ADMIN_SETUP.md`:

```bash
# 1. Create OIDC Provider
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# 2. Create IAM Role
aws iam create-role \
  --role-name github-actions-deploy \
  --assume-role-policy-document file:///tmp/trust-policy.json

# 3. Attach Policy
aws iam attach-role-policy \
  --role-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

**Verify:**
```bash
aws iam get-role --role-name github-actions-deploy --query 'Role.Arn'
# Expected: arn:aws:iam::684756697968:role/github-actions-deploy
```

### Step 2: Trigger GitHub Actions Deployment (1 click, 3 min)

1. Go to: https://github.com/lngqaza/sanlamconnect-qa-portal/actions
2. Select: "Deploy QA Portal" workflow
3. Click: "Run workflow" button
4. Select: Environment = `dev`
5. Click: "Run workflow" (green button)
6. Monitor: Workflow should complete in 3-5 minutes

**Check status:**
```bash
gh run list --repo lngqaza/sanlamconnect-qa-portal --limit 1 --json status,conclusion
# Expected: { "status": "completed", "conclusion": "success" }
```

### Step 3: Extract URLs After Deployment Succeeds (10 min)

Once workflow completes, run these commands to get the actual URLs:

```bash
#!/bin/bash
# Extract CloudFront URL (Dashboard)
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stack-resource \
  --stack-name sanlamconnect-qa-portal-dev \
  --logical-resource-id CloudFrontDistribution \
  --region eu-west-1 \
  --query 'StackResourceDetail.PhysicalResourceId' \
  --output text)

echo "Dashboard URL: https://$CLOUDFRONT_DOMAIN"

# Extract API Gateway URL
API_ID=$(aws apigateway get-rest-apis \
  --region eu-west-1 \
  --query 'items[?name==`qa-portal-api-dev`].id' \
  --output text)

echo "API Base: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev"
echo "Test Execute: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev/test/execute"
echo "Test History: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev/test/history"

# Save for future reference
cat > ~/.sanlamconnect-qa-portal-urls.txt << EOF
# QA Portal URLs (Dev Environment)
# Generated: $(date)

DASHBOARD: https://$CLOUDFRONT_DOMAIN
API_BASE: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev
API_TEST_EXECUTE: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev/test/execute
API_TEST_STATUS: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev/test/{run_id}/status
API_TEST_LOGS: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev/test/{run_id}/logs
API_TEST_HISTORY: https://$API_ID.execute-api.eu-west-1.amazonaws.com/dev/test/history
EOF

echo ""
echo "URLs saved to: ~/.sanlamconnect-qa-portal-urls.txt"
```

---

## 💾 Access Pattern: CloudFront Dashboard

The main user-facing interface is the **React SPA hosted on CloudFront**:

```
https://d{RANDOM}.cloudfront.net/
    ↓
    ├─ Static assets (React, CSS, JS) from S3
    │
    └─ API calls to API Gateway
        ├─ POST /test/execute
        ├─ GET /test/{run_id}/status
        ├─ GET /test/{run_id}/logs
        └─ GET /test/history
```

**Key Points:**
- No authentication required (publicly accessible at CloudFront URL)
- All API calls go through API Gateway
- Results stored in DynamoDB
- Logs streamed from CloudWatch Logs
- Reports generated on-demand and stored in S3

---

## 🎯 Quick Access After Deployment

### For Team Members (Using Dashboard)
```
1. Copy CloudFront URL from AWS admin/ops team
2. Paste into browser
3. Select test mode (dry-run recommended first)
4. Select suites
5. Click Execute
6. Monitor results live
7. Download report when complete
```

### For Ops Team (Monitoring)
```bash
# View dashboard logs in real-time
aws logs tail "/qa-portal/dev" --follow

# Check test runs in DynamoDB
aws dynamodb scan \
  --table-name qa-portal-test-runs-dev \
  --region eu-west-1 \
  --limit 5

# Monitor Lambda errors
aws logs tail "/aws/lambda/qa-portal-test-executor-dev" --follow
```

### For Developers (Testing API)
```bash
# Test health
curl https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/test/history

# Trigger test
curl -X POST https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/test/execute \
  -H "Content-Type: application/json" \
  -d '{"mode":"dry-run","suites":["alarms","reports"]}'

# Get results
curl https://{API_ID}.execute-api.eu-west-1.amazonaws.com/dev/test/{run_id}/status
```

---

## 📊 What URLs Provide

### CloudFront Dashboard
✅ Web UI for executing tests  
✅ Live results monitoring (5-sec polling)  
✅ Test history view  
✅ Report download (HTML/PDF)  
✅ User-friendly interface (no CLI needed)  

### API Gateway Endpoints
✅ Programmatic test execution  
✅ Status polling  
✅ Log streaming  
✅ History queries  
✅ Integrable with external systems  

### AWS Resources
✅ Test data persistence (DynamoDB)  
✅ Execution logs (CloudWatch Logs)  
✅ Reports archive (S3)  
✅ Global CDN caching (CloudFront)  

---

## 🔒 Security & Access Control

| Component | Access Level | Auth Required | Notes |
|-----------|------------|-----------|-------|
| CloudFront Dashboard | Public (HTTPS only) | None | No credentials needed |
| API Gateway | Public (HTTPS only) | None | CORS enabled |
| S3 Bucket | Private (via CloudFront only) | None | OAI enforces CDN-only |
| DynamoDB Tables | Private (Lambda only) | IAM | Not directly accessible |
| CloudWatch Logs | IAM-controlled | AWS credentials | Ops team access |

---

## 📈 Scaling to QA/Prod

To deploy to additional environments, update the deployment commands:

```bash
# Deploy to QA environment
gh workflow run deploy-qa-portal.yml -f environment=qa

# Deploy to Production environment
gh workflow run deploy-qa-portal.yml -f environment=prod
```

Each environment will have its own:
- CloudFormation stack: `sanlamconnect-qa-portal-{env}`
- S3 bucket: `sanlamconnect-qa-portal-{accountid}-{env}`
- DynamoDB tables: `qa-portal-test-runs-{env}`
- CloudFront domain: `d{random}.cloudfront.net`
- API Gateway: `https://{apiid}.execute-api.eu-west-1.amazonaws.com/{env}`

---

## 🎭 UI Preview

The dashboard UI has been enhanced with:

✨ **Modern Dark Theme**
- Professional slate-950 base with blue accents
- Better contrast and readability
- Modern gradient buttons

📊 **Improved Visual Hierarchy**
- Clear test suite descriptions
- Mode selection with duration indicators
- Status cards with icons and animations

🎨 **Better Component Design**
- Color-coded metric cards (emerald/red/amber)
- Polished logs display with line numbers
- Enhanced history view with result summaries
- Smooth animations and transitions

🎯 **Better UX**
- Helpful empty states
- Real-time status updates
- Clear action buttons
- Responsive layout

---

## ✅ Deployment Checklist

- [ ] AWS admin: Execute OIDC + IAM setup (5 min)
- [ ] AWS admin: Verify role exists
- [ ] Deployment user: Trigger GitHub Actions workflow
- [ ] Deployment user: Monitor workflow (3-5 min)
- [ ] Deployment user: Extract CloudFront URL
- [ ] Deployment user: Extract API endpoints
- [ ] Deployment user: Save URLs to shared location
- [ ] Ops team: Share CloudFront URL with dev team
- [ ] Dev team: Open dashboard in browser
- [ ] Dev team: Execute first test (dry-run mode)
- [ ] Dev team: Download and review test report
- [ ] QA team: Verify system is operational

---

## 📞 Reference

- **Dashboard Repository:** https://github.com/lngqaza/sanlamconnect-qa-portal
- **AWS Region:** eu-west-1
- **AWS Account:** 684756697968
- **CloudFormation Stack:** sanlamconnect-qa-portal-{environment}
- **Latest Commit:** dba9531 (UI enhancements)

---

## 🚀 Next Steps

1. **AWS Admin:** Execute 3 IAM commands from `AWS_ADMIN_SETUP.md`
2. **Deployment User:** Follow `QUICK_START.md` Steps 2-3
3. **Run verification:** Use `DEPLOYMENT_VERIFICATION.md` Phase 1-3
4. **Share URLs:** Distribute CloudFront URL to team
5. **Go live:** Team accesses dashboard and executes first test

---

**Ready to deploy? Start with `AWS_ADMIN_SETUP.md` — it's only 5 commands!**

*Latest Update: 2026-05-16 | UI Enhanced with Modern Dark Theme ✨*
