# QA Portal Language Glossary

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-05-18  
**Purpose:** Eliminate technical jargon, replace with business-friendly language

---

## Translation Table: Technical → Business-Friendly

### Application & Dashboard Names

| Technical | Business-Friendly | Example Usage |
|---|---|---|
| QA Portal | Validation Lab | "Welcome to the Validation Lab" |
| Test Suite | Validation Check | "Run validation checks" |
| Test Run | Validation Execution | "View past executions" |

### Execution Modes

| Technical | Business-Friendly | Duration | What It Does |
|---|---|---|---|
| Dry-Run | Quick Check | 2 min | Verify structure & syntax only |
| Mock | Standard Check | 5 min | Verify logic with safe test data |
| Live | Full Check | 45 min | Real system validation |

### AWS Services (Hidden from Users)

| Technical (Internal) | Business-Friendly (UI) | What We're Hiding |
|---|---|---|
| Lambda Function | Automated Task | AWS service name |
| DynamoDB | Test Database | Database technology |
| CloudWatch Logs | System Logs | Logging service |
| S3 Bucket | Report Storage | Storage service |
| CloudFront Distribution | Delivery Network | CDN service |
| API Gateway | API Service | Gateway service |

### Validation Check Names

| Technical | Business-Friendly | What We're Checking |
|---|---|---|
| CloudWatch Alarms | Alert System Health | Do alerts get sent when problems occur? |
| Financial Calculator | Cost Impact Calculation | Is downtime cost calculated correctly? |
| Dashboard Refresh | Metrics Accuracy | Are live metrics updating correctly? |
| Scheduled Reports | Report Generation | Can we generate compliance reports? |
| Exception Monitoring | Problem Detection | Do we catch issues before they spread? |
| Self-Healing | Automatic Recovery | Can we recover from failures automatically? |
| Alarm Notifications | Notification Delivery | Are alerts being sent to the right people? |
| Data Consistency | Cross-System Sync | Is data correct across all systems? |

### Results & Status

| Technical | Business-Friendly | Icon | Meaning |
|---|---|---|---|
| PASS | Working Correctly | OK | System behaved as expected |
| FAIL | Problem Detected | X | System did not behave as expected |
| PENDING | Checking... | ... | Test still running |
| SKIPPED | Not Applicable | - | Test did not run |
| ERROR | Unexpected Error | ! | Test crashed |

### Performance Metrics

| Technical | Business-Friendly | Why It Matters |
|---|---|---|
| MTTD | Detection Time (average) | How fast do we notice problems? |
| MTTR | Recovery Time (average) | How fast do we fix problems? |
| P95 Response Time | Response Time (95th percentile) | How long do most requests take? |
| Error Rate | Problem Frequency | How often do things break? |
| Availability % | Platform Uptime | What percentage of time is system working? |
| Throughput | Requests Per Second | How much traffic can we handle? |

---

## Example Translations

### For Developers
- Technical: "Invoke Lambda function to validate CloudWatch metrics"
- Business: "Verify platform health checks are responding correctly"

### For Operations
- Technical: "SLA breach detected in MTTD metric"
- Business: "Platform response time is slower than usual. We are investigating. Check back in 10 minutes."

### For Executives
- Technical: "Validation run completed with 0 failures and 8 assertions passed"
- Business: "All 8 system checks passed. Platform is production-ready. Compliance report generated."

---

## UI Copy Guidelines

### Headers & Titles

| Wrong | Correct |
|---|---|
| "QA Portal Dashboard" | "Validation Lab" |
| "Execute Test Suite" | "Run Validation Checks" |
| "View Logs" | "View System Details" |

### Descriptions

| Wrong | Correct |
|---|---|
| "Lambda validates CloudWatch metrics" | "Verify platform health checks are responding" |
| "DynamoDB stores test results" | "Results are saved for record-keeping" |
| "S3 bucket contains reports" | "Reports are saved for download" |

### Button Labels

| Wrong | Correct |
|---|---|
| "Execute" | "Run Validation" |
| "View Details" | "See What Was Checked" |
| "Download Report" | "Download Compliance Report" |

### Error Messages

| Wrong | Correct |
|---|---|
| "500 Internal Server Error" | "Something went wrong. Contact ops if this keeps happening." |
| "Timeout after 30000ms" | "System took too long to respond. Try again in a few minutes." |
| "Database connection timeout" | "Database is not responding. Checking connection..." |

---

## Tone of Voice

Professional but accessible. Use clear action items, business outcomes, active voice. Avoid technical jargon, unexplained acronyms, passive voice.

---

## Quick Reference

ALWAYS USE:
- Cost of Downtime (NOT "KPI financial-impact-24h")
- Detection Time (NOT "MTTD")
- Working Correctly (NOT "0 exit code")
- Platform Health (NOT "Infrastructure monitoring status")
- Automated Task (NOT "Lambda function")
- System Logs (NOT "CloudWatch logs")
- Report Storage (NOT "S3 bucket")
- Full Check (NOT "Live mode")
- Quick Check (NOT "Dry-run")

---

## Implementation Plan

Week 1: Audit & Prepare
Week 2: Update React Components
Week 3: Update Error Handling
Week 4: Update Documentation
Week 5: User Testing

---

**Last Updated:** 2026-05-18  
**Version:** 1.0  
**Maintained By:** SanlamConnect QA Team
