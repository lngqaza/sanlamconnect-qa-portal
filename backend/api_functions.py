import json
import os
import boto3
from datetime import datetime
from dynamodb_service import TestRunsDB, TestReportsDB

dynamodb = boto3.resource('dynamodb')
logs = boto3.client('logs')
s3 = boto3.client('s3')

test_runs_db = TestRunsDB(dynamodb)
test_reports_db = TestReportsDB(dynamodb)


def success_response(data, status_code=200):
    """Format success response"""
    return {
        'statusCode': status_code,
        'body': json.dumps(data),
        'headers': {'Content-Type': 'application/json'}
    }


def error_response(error_msg, status_code=500):
    """Format error response"""
    return {
        'statusCode': status_code,
        'body': json.dumps({'error': error_msg}),
        'headers': {'Content-Type': 'application/json'}
    }


def test_status_handler(event, context):
    """GET /test/{run_id}/status - Get test run status"""
    try:
        run_id = event['pathParameters']['run_id']
        created_at = event['queryStringParameters'].get('created_at')

        if not created_at:
            return error_response('Missing created_at', 400)

        run = test_runs_db.get_run(run_id, created_at)

        if not run:
            return error_response('Test run not found', 404)

        return success_response({
            'run_id': run['run_id'],
            'status': run.get('status'),
            'mode': run.get('mode'),
            'suites': run.get('suites'),
            'started_at': run.get('started_at'),
            'completed_at': run.get('completed_at'),
            'duration_seconds': run.get('duration_seconds'),
            'results_summary': run.get('results_summary'),
            'created_at': run.get('created_at')
        })

    except Exception as e:
        return error_response(str(e))


def test_logs_handler(event, context):
    """GET /test/{run_id}/logs - Get test execution logs"""
    try:
        run_id = event['pathParameters']['run_id']
        log_group = os.environ.get('LOG_GROUP', '/qa-portal/test-runs')

        try:
            response = logs.filter_log_events(
                logGroupName=log_group,
                logStreamNamePrefix=run_id,
                limit=100
            )
            events = response.get('events', [])
            log_lines = [event['message'] for event in events]

            return success_response({
                'run_id': run_id,
                'logs': log_lines,
                'last_line': len(log_lines)
            })
        except logs.exceptions.ResourceNotFoundException:
            return success_response({
                'run_id': run_id,
                'logs': [],
                'last_line': 0
            })

    except Exception as e:
        return error_response(str(e))


def test_history_handler(event, context):
    """GET /test/history - Get past test runs"""
    try:
        limit = int(event['queryStringParameters'].get('limit', 10))
        runs = test_runs_db.list_runs(limit)

        return success_response({
            'runs': [
                {
                    'run_id': r['run_id'],
                    'mode': r.get('mode'),
                    'status': r.get('status'),
                    'created_at': r.get('created_at'),
                    'duration_seconds': r.get('duration_seconds'),
                    'created_by': r.get('created_by')
                }
                for r in runs
            ],
            'total': len(runs)
        })

    except Exception as e:
        return error_response(str(e))


def report_generator_handler(event, context):
    """POST /report/generate - Generate test report"""
    try:
        body = json.loads(event.get('body', '{}'))
        run_id = body.get('run_id')
        report_format = body.get('format', 'html')

        if not run_id:
            return error_response('Missing run_id', 400)

        # TODO: Fetch test results from DynamoDB
        # TODO: Generate HTML or PDF report
        # TODO: Upload to S3
        # TODO: Generate presigned URL

        report_id = f"{run_id}-{report_format}"
        s3_url = f"s3://{os.environ.get('S3_BUCKET')}/reports/{report_id}.{report_format}"

        test_reports_db.create_report({
            'report_id': report_id,
            'run_id': run_id,
            'format': report_format,
            's3_url': s3_url,
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'status': 'ready'
        })

        return success_response({
            'report_id': report_id,
            'format': report_format,
            'status': 'ready',
            'url': s3_url
        }, 201)

    except Exception as e:
        return error_response(str(e))


def report_download_handler(event, context):
    """GET /report/{report_id} - Download report via presigned URL"""
    try:
        report_id = event['pathParameters']['report_id']
        report = test_reports_db.get_report(report_id)

        if not report:
            return error_response('Report not found', 404)

        # Generate presigned URL (valid 24 hours)
        bucket = os.environ.get('S3_BUCKET')
        key = f"reports/{report_id}.{report['format']}"

        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=86400  # 24 hours
        )

        return {
            'statusCode': 302,
            'headers': {'Location': presigned_url},
            'body': ''
        }

    except Exception as e:
        return error_response(str(e))
