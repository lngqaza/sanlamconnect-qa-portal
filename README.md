# SanlamConnect Validation Lab

**System Health Verification & Compliance Reporting**

Modern, production-ready quality assurance dashboard for executing automated system checks, verifying platform health, and generating compliance reports.

---

## What Is Validation Lab?

Validation Lab is a comprehensive system verification platform that helps you:

- **Verify Platform Health** — Run quick checks to ensure your systems are working correctly
- **Generate Compliance Reports** — Document system validation for audit purposes
- **Track Validation History** — Keep records of all checks and their outcomes
- **Automate Quality Assurance** — Replace manual testing with automated validation

## Key Features

### 8 System Checks

1. **Alert System Health** — Do alerts get sent when problems occur?
2. **Cost Impact Calculation** — Is downtime cost calculated correctly?
3. **Metrics Accuracy** — Are live metrics updating correctly?
4. **Report Generation** — Can we generate compliance reports?
5. **Problem Detection** — Do we catch issues before they spread?
6. **Automatic Recovery** — Can we recover from failures automatically?
7. **Notification Delivery** — Are alerts being sent to the right people?
8. **Cross-System Sync** — Is data correct across all systems?

### 3 Execution Modes

- **Quick Check** (2 min) — Verify structure & syntax only
- **Standard Check** (5 min) — Verify logic with safe test data
- **Full Check** (45 min) — Real system validation

### Modern Design

- Dark professional theme (ops room aesthetic)
- Real-time status updates (5-second polling)
- Business-friendly language (no technical jargon)
- Mobile-responsive layout
- Accessibility-first design (WCAG AA)

### Compliance & Reporting

- Export validation results as HTML or PDF
- 90-day result history
- 180-day report archive
- Automated cleanup policies
- Audit trail logging

---

## Getting Started

### Deploy

```bash
# 1. AWS Admin runs 3 commands (5 min)
# See: AWS_ADMIN_SETUP.md

# 2. Trigger deployment (automated, 3-5 min)
gh workflow run deploy-qa-portal.yml -f environment=dev

# 3. Extract your URL
aws cloudformation describe-stack-resource \
  --stack-name sanlamconnect-qa-portal-dev \
  --logical-resource-id CloudFrontDistribution \
  --region eu-west-1 \
  --query 'StackResourceDetail.PhysicalResourceId' \
  --output text
```

### Use the Dashboard

1. **Open** → `https://d{YOUR-ID}.cloudfront.net`
2. **Select** → Which systems you want to check
3. **Choose** → How thorough (Quick / Standard / Full)
4. **Run** → Click "Run Validation"
5. **Monitor** → Watch real-time results
6. **Download** → Export compliance report

---

## Architecture

**Frontend:**
- React 18 + TypeScript
- TailwindCSS styling
- Modern dark theme
- Real-time polling (5-sec updates)

**Backend:**
- Python Lambda functions
- API Gateway (REST endpoints)
- DynamoDB (test results storage)
- CloudWatch (logs & metrics)

**Hosting:**
- CloudFront CDN (global distribution)
- S3 (static assets)
- ECS Fargate (backend services)

**Infrastructure:**
- 100% Infrastructure as Code (CloudFormation)
- Automated deployment (GitHub Actions)
- Zero long-lived credentials (OIDC)
- Fully serverless (auto-scaling)

---

## Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **START_HERE.md** | Quick overview, 3-step path | 5 min |
| **AWS_ADMIN_SETUP.md** | AWS setup instructions | 5 min |
| **QUICK_START.md** | Deployment checklist | 10 min |
| **DEPLOYMENT_URLS.md** | URL extraction guide | 10 min |
| **DEPLOYMENT_VERIFICATION.md** | Post-deploy checklist | 15 min |
| **DESIGN_SYSTEM.md** | Design specifications | Reference |
| **LANGUAGE_GLOSSARY.md** | Business term translations | Reference |

---

## Cost

**Monthly Operating Cost:**
- Lambda: $0.20
- DynamoDB: $0.50
- S3: $0.05
- CloudFront: $0.50
- CloudWatch: $0.50
- API Gateway: $1.50
- **Total: ~$3.75/month** (dev environment)

No upfront costs. Pay-as-you-go model scales with usage.

---

## Support

### Common Questions

**Q: Do I need to code anything?**  
A: No. All code is written. You only deploy and run.

**Q: How long does deployment take?**  
A: ~13 minutes total (mostly automated).

**Q: Can I scale it?**  
A: Yes, automatically. No configuration needed.

**Q: What if something breaks?**  
A: All infrastructure is version-controlled. One command to rollback.

**Q: Can I use it for QA, Staging, Production?**  
A: Yes. Redeploy with `environment=qa` or `environment=prod`.

### Need Help?

- **Architecture Questions** → See README.md (this file)
- **Deployment Issues** → See QUICK_START.md
- **URL Extraction** → See DEPLOYMENT_URLS.md
- **Design System** → See DESIGN_SYSTEM.md
- **Business Language** → See LANGUAGE_GLOSSARY.md

---

## Technology Stack

**Languages:**
- TypeScript (frontend)
- Python 3.11+ (backend)

**Frontend:**
- React 18.x
- TailwindCSS 3.x
- Lucide Icons

**Backend:**
- Python Fastify-like async handlers
- Boto3 (AWS SDK)
- pytest (testing)

**Infrastructure:**
- AWS CloudFormation
- GitHub Actions (CI/CD)
- OIDC (secure credentials)

**Cloud Services:**
- Lambda
- API Gateway
- DynamoDB
- S3
- CloudFront
- CloudWatch
- ECS Fargate

---

## Development

### Local Development

```bash
# Not supported - fully AWS-native
# All development happens via GitHub → AWS
```

### Build & Deploy

```bash
# Push to GitHub main branch
git push origin main

# GitHub Actions automatically:
# 1. Builds Lambda package
# 2. Builds React dashboard
# 3. Deploys CloudFormation stack
# 4. Updates CloudFront cache

# Monitor deployment:
gh workflow view deploy-qa-portal
```

### Testing

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test

# Both are run automatically in GitHub Actions
```

---

## Repository

- **GitHub:** https://github.com/lngqaza/sanlamconnect-qa-portal
- **Latest Commit:** See git log
- **Branch:** main (production-ready)
- **Status:** ✅ Complete & Ready to Deploy

---

## License

**Proprietary - SanlamConnect Internal**

All code, documentation, and infrastructure specifications are proprietary to SanlamConnect. Unauthorized copying, distribution, or use is prohibited.

---

## Support & Contact

For questions or issues:
1. Check the relevant documentation file above
2. Review the GitHub issues page
3. Contact the SanlamConnect QA team

---

**Ready to validate your systems? Start with START_HERE.md (5 minutes)**

*Last Updated: 2026-05-18*  
*Status: ✅ Production Ready*
