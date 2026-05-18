# SanlamConnect LXP Platform Architecture Assessment

Date: 2026-05-18

This document consolidates the current understanding of the SanlamConnect LXP platform ecosystem before dashboard redesign work. It separates verified AWS/local evidence from reported handover information where direct verification was blocked by IAM or by unavailable local Windows paths.

## Executive Summary

SanlamConnect is an AWS-hosted learning experience platform ecosystem. The core production services are the LXP frontend, LXP backend, VR Lab, Moodle integration, monitoring/reporting services, and the QA Portal. The right dashboard model is not two isolated dashboards, but a unified intelligence layer with role-based views:

- Executive: business health, CPD outcomes, adoption, risk, and financial impact.
- Operator: uptime, validation status, sync health, alerts, and incident context.
- Engineer: API health, ECS health, logs, traces, integration failures, and deployment detail.

## Evidence Levels

- Verified: confirmed from AWS APIs or local files in this session.
- Reported: present in handover notes or user-provided architecture text, but not directly verified here.
- Unknown: requires source repo access, broader IAM, or console/export evidence.

## Verified AWS Inventory

Account and region:

```text
AWS account: 684756697968
Region: eu-west-1
```

Live ECS services:

| Component | Cluster | Service | Task Definition | Desired/Running | Port | Status |
| --- | --- | --- | --- | --- | --- | --- |
| LXP Backend | `sanlamconnect-lxp-backend-runtime` | `sanlamconnect-lxp-backend` | `sanlamconnect-lxp-backend:122` | 1/1 | 3001 | Verified live |
| LXP Frontend | `sanlamconnect-lxp-frontend` | `sanlamconnect-lxp-frontend` | `sanlamconnect-lxp-frontend:75` | 1/1 | 3000 | Verified live |
| VR Lab | `sanlamconnect-vr-lab` | `sanlamconnect-vr-lab` | `sanlamconnect-vr-lab:12` | 1/1 | 8000 | Verified live |
| iHub API | `sanlamconnect-ihub-api` | `sanlamconnect-ihub-api` | `sanlamconnect-ihub-api:4` | 0/0 | 3001 | Built but inactive |
| iHub Web | `sanlamconnect-ihub-web` | `sanlamconnect-ihub-web` | `sanlamconnect-ihub-web:8` | 0/0 | 3000 | Built but inactive |

Load balancers and target groups:

| Component | Load Balancer | Scheme | Health Path | Target Health |
| --- | --- | --- | --- | --- |
| LXP Backend | `sc-lxp-backend-alb-1007935242.eu-west-1.elb.amazonaws.com` | Internet-facing | `/health` | Healthy |
| LXP Frontend | `sanlamconnect-lxp-frontend-alb-1353897991.eu-west-1.elb.amazonaws.com` | Internet-facing | `/api/health` | Healthy |
| VR Lab | `sanlamconnect-vr-lab-alb-121690061.eu-west-1.elb.amazonaws.com` | Internet-facing | `/health` | Healthy |
| Moodle | `internal-sanlamconnect-lxp-moodle-alb-1734793016.eu-west-1.elb.amazonaws.com` | Internal | `/login/index.php` | Reported healthy |

QA Portal:

```text
CloudFormation stack: sanlamconnect-qa-portal-dev
Status: CREATE_COMPLETE
Dashboard: https://dwf3ks4dra8f3.cloudfront.net
API: https://4957vc3rj7.execute-api.eu-west-1.amazonaws.com/dev
S3 bucket: sanlamconnect-qa-portal-dev-dashboard-684756697968
DynamoDB table: qa-portal-test-runs-dev
Log group: /qa-portal/test-runs/dev
```

## Architecture Diagram

```text
Users
  |
  v
LXP Frontend, Next.js on ECS
  |
  | API/proxy calls
  v
LXP Backend, Node/Fastify on ECS
  |
  +--> PostgreSQL/RDS, reported LXP operational data store
  +--> Moodle, EC2 behind internal ALB, LMS courses/completions
  +--> VR Lab, ECS service, scenario launch and completion callbacks
  +--> Bedrock, AI/recommendation capability
  +--> Secrets Manager, runtime secrets
  +--> CloudWatch/Dynatrace, observability and business events

QA Portal
  |
  +--> API Gateway + Lambda + DynamoDB + CloudWatch Logs
  +--> Validates platform checks and compliance-style reports

Performance Intelligence
  |
  +--> Static/business KPI dashboard plus monitoring-derived KPIs

iHub API/Web
  |
  +--> ECS services exist but are scaled to zero
  +--> Candidate foundation for unified Intelligence Hub
```

## User Journey And Data Flow

```text
1. Login
   - User authenticates through the LXP frontend.
   - NextAuth creates the application session.
   - Authentication source needs final confirmation: Moodle, LDAP/SSO, local table, or hybrid.

2. Browse LXP Dashboard
   - Frontend loads profile, CPD summary, courses, and recommendations.
   - Backend aggregates data from LXP records, Moodle, VR attempts, and AI services.

3. Enroll In Moodle Course
   - LXP initiates course enrollment.
   - Backend calls Moodle REST API using a Moodle service token.
   - Moodle records the LMS enrollment.
   - LXP reconciles enrollment/completion state for reporting.

4. Launch VR Lab Scenario
   - LXP backend issues signed launch token/JWT.
   - Backend stores only the launch token hash.
   - Browser redirects to VR Lab.
   - VR Lab validates launch material and starts the scenario.

5. Complete VR Lab Scenario
   - VR Lab records score and outcome.
   - VR Lab posts HMAC-signed completion webhook to LXP backend.
   - Backend verifies signature, checks token hash, prevents replay, updates attempt, and awards CPD if criteria are met.

6. View CPD History
   - LXP dashboard reads CPD records from backend.
   - CPD totals combine Moodle course completions and VR Lab scenario completions.

7. Sync Moodle Completions
   - Scheduled or manual sync calls Moodle REST APIs.
   - Completions, grades, and enrollment state are reconciled into LXP reporting records.

8. Compliance Review
   - Manager/compliance user reviews CPD totals, categories, evidence, and reports.
```

## Source Of Truth

| Data | Source Of Truth | Sync Direction | Frequency |
| --- | --- | --- | --- |
| User profile | Moodle or identity provider, needs confirmation | Auth source to LXP | On login or sync |
| Courses | Moodle | Moodle to LXP | Nightly or manual |
| Enrollments | Moodle, likely initiated by LXP | LXP to Moodle, then Moodle to LXP reconciliation | Real-time plus sync |
| Moodle completions | Moodle | Moodle to LXP | Nightly or manual |
| VR Lab attempts | VR Lab event, recorded by LXP backend | VR Lab to LXP | Real-time webhook |
| CPD records | LXP backend aggregate | Moodle and VR Lab to LXP | Real-time for VR, scheduled for Moodle |
| Reports | LXP reporting layer | LXP to dashboard/export | On demand |
| Platform health | CloudWatch/Dynatrace/KPI layer | AWS/monitoring to dashboards | Real-time or scheduled |

## Component Inventory

### Built And Deployed

| Component | Purpose | Tech/Hosting | Status |
| --- | --- | --- | --- |
| LXP Backend | API, Moodle/VR/Bedrock integrations, CPD aggregation | Node/Fastify on ECS Fargate | Verified live |
| LXP Frontend | Learner/adviser/admin web experience | Next.js on ECS Fargate | Verified live |
| VR Lab | Scenario simulations and completion scoring | ECS Fargate service | Verified live |
| Moodle | LMS courses, enrollments, completions, grades | EC2 behind internal ALB | Reported operational |
| QA Portal | Validation checks and compliance-style reports | React, API Gateway, Lambda, DynamoDB, S3, CloudFront | Verified live |
| Performance Intelligence | Business/financial/platform KPI dashboard | Reported static dashboard and monitoring-derived data | Reported deployed |
| Self-healing infrastructure | Recovery and health automation | Reported Lambda/CloudWatch/EventBridge | Reported deployed |

### Built But Inactive Or Decision Needed

| Component | Status | Decision |
| --- | --- | --- |
| iHub API | ECS service exists, scaled 0/0 | Revive for Intelligence Hub API or remove |
| iHub Web | ECS service exists, scaled 0/0 | Revive for Intelligence Hub frontend or remove |
| QuickSight BI | Optional/manual | Confirm whether business BI is required |

### Future Or Not Yet Built

- Unified Intelligence Hub.
- Advanced adviser dashboards.
- Compensation linkage.
- Mobile app.
- Offline learning.
- Third-party CRM/support integrations.
- Custom e-learning authoring.
- API usage quotas/rate limiting, unless already implemented elsewhere.

## Tech Stack Summary

| Area | Stack |
| --- | --- |
| LXP Frontend | Next.js/React/TypeScript, reported NextAuth and Tailwind |
| LXP Backend | Node.js/Fastify, AWS SDK, PostgreSQL integration |
| VR Lab | ECS service on port 8000; implementation reported as Python/FastAPI but source not verified here |
| Moodle | EC2-hosted Moodle behind internal ALB |
| QA Portal | React 18, TypeScript, Tailwind, API Gateway, Lambda, DynamoDB, S3, CloudFront |
| Infrastructure | ECS Fargate, ALB, CloudFormation, ECR, Secrets Manager, CloudWatch |
| Monitoring | CloudWatch Logs verified; Dynatrace secrets/backend plumbing verified; dashboards/alarms/KPI Lambda reported |

## Deployment Model

```text
Developer push to GitHub main
  -> GitHub Actions
  -> Security and quality gates
  -> Docker image build
  -> Push to ECR
  -> CloudFormation update
  -> ECS rolling deployment
  -> ALB target health checks
  -> CloudWatch/Dynatrace runtime observation
```

Supporting tools:

- Docker for container packaging.
- GitHub Actions for CI/CD.
- GitHub OIDC for AWS authentication without long-lived keys.
- ECR for container images.
- CloudFormation for infrastructure deployment.
- Secrets Manager for runtime secret injection.
- CloudWatch Logs for logs and diagnostics.
- SNS/Lambda/Slack alerting is reported.
- S3 KPI exports for BI are reported.

## Monitoring And Observability

Verified:

- CloudWatch log groups exist for LXP backend, frontend, VR Lab, iHub, QA Portal, and several Lambda functions.
- Backend task definition injects `DT_ENVIRONMENT_ID` and `DT_INGEST_TOKEN`.
- Dynatrace AWS integration secrets exist.
- QA Portal stack outputs and log group exist.

Reported:

- Dynatrace OneAgent/APM coverage is live.
- Three CloudWatch dashboards exist: ops, incidents, business KPIs.
- Eleven CloudWatch alarms are configured.
- KPI Lambda runs hourly and exports KPI JSON to S3.
- Slack receives alerts via SNS and notification Lambda.
- QuickSight is optional/manual.

Unknown/pending verification:

- Dynatrace console entity coverage for frontend, VR Lab, Moodle, and backend traces.
- CloudWatch dashboard and alarm inventory.
- EventBridge schedule for KPI Lambda.
- S3 KPI export bucket and latest outputs.
- Slack and PagerDuty delivery evidence.

## Current Blockers And Open Questions

Resolved:

- QA Portal AWS IAM/deployment blocker is resolved. Stack is `CREATE_COMPLETE`.
- VR Lab service is running and target healthy.
- LXP backend and frontend are running and target healthy.

Open:

- Confirm authentication source of truth: Moodle/LDAP, local NextAuth, or hybrid.
- Confirm Moodle REST token works today through backend `/moodle/status`.
- Confirm RDS details and table schema with RDS/DB access.
- Confirm full Dynatrace entity coverage in the Dynatrace console.
- Confirm CloudWatch dashboards, alarms, EventBridge schedules, KPI S3 output, and QuickSight.
- Decide whether inactive iHub services should become the new Intelligence Hub.
- Confirm canonical source repos on the Windows desktop or provide a mounted/exported copy for code-level analysis.

## Dashboard Redesign Implications

The dashboard redesign should frame the ecosystem as one platform with three lenses:

1. Performance Observatory
   - Question: Is the platform performing for the business?
   - Audience: executives, operators, business owners.
   - Metrics: uptime, active learners, CPD hours, adoption, revenue/risk impact, cost of downtime.

2. Validation Lab
   - Question: Have we proven that platform controls still work?
   - Audience: operators, QA, compliance, engineers.
   - Metrics: validation pass rate, alert readiness, Moodle sync checks, VR webhook checks, report generation checks.

3. Intelligence Hub
   - Question: Where should each role start?
   - Audience: all roles.
   - Features: role-based entry, search/discovery, shared navigation, health cards, links to observability and validation surfaces.

Recommended next implementation order:

1. Decide whether to revive `sanlamconnect-ihub-web` and `sanlamconnect-ihub-api` or create a new hub app.
2. Confirm the open monitoring/auth/Moodle checks.
3. Redesign QA Portal as Validation Lab.
4. Redesign Performance Intelligence as Performance Observatory.
5. Add a shared navigation and business language layer across all dashboard surfaces.

## Reported Windows Paths

These paths were provided in handover notes but are not mounted in this Linux session:

```text
C:\Users\e1000836\Desktop\sanlam-lxp
C:\Users\e1000836\Desktop\sanlam-lxp\apps\lxp-api
C:\Users\e1000836\Desktop\sanlam-lxp\apps\lxp-web
C:\Users\e1000836\Desktop\sanlam-lxp\infra
C:\Users\e1000836\Desktop\sanlam-lxp\monitoring
C:\Users\e1000836\Desktop\sanlamconnect-qa-portal
C:\Users\e1000836\Desktop\lxp-reports
C:\Users\e1000836\Desktop\lxp-selfheal
C:\Users\e1000836\Desktop\sanlamconnect-lxp
```

The last path is reported deprecated and should not be used as the canonical LXP source.

## Directly Visible Local Paths

```text
/tmp/sanlamconnect-qa-portal
/home/ssm-user/.codex/memories/lxp_handover_backlog.md
```
