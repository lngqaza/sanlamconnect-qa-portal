import json
import uuid
from datetime import datetime
import boto3
from dynamodb_service import TestRunsDB

dynamodb = boto3.resource('dynamodb')
db = TestRunsDB(dynamodb)

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
}


def handler(event, context):
    """POST /test/execute - Queue a test run"""
    try:
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 204,
                'headers': CORS_HEADERS,
                'body': ''
            }

        body = json.loads(event.get('body', '{}'))
        mode = body.get('mode')
        suites = body.get('suites', [])

        if not mode or not suites:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Please select execution mode and at least one system to check'})
            }

        run_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + 'Z'

        db.create_run({
            'run_id': run_id,
            'mode': mode,
            'suites': suites,
            'status': 'pending',
            'created_at': timestamp,
            'created_by': 'user@sanlamconnect.com'
        })

        # TODO: Trigger async test execution
        # For now, return queued status
        return {
            'statusCode': 202,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'run_id': run_id,
                'status': 'queued',
                'timestamp': timestamp
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }
