import os
from datetime import datetime, timedelta


class TestRunsDB:
    """DynamoDB operations for test runs"""

    def __init__(self, dynamodb_resource):
        self.table = dynamodb_resource.Table(
            os.environ.get('TEST_RUNS_TABLE', 'qa-portal-test-runs')
        )

    def create_run(self, data):
        """Create new test run record"""
        ttl = int((datetime.utcnow() + timedelta(days=90)).timestamp())
        data['ttl'] = ttl
        self.table.put_item(Item=data)
        return data.get('run_id')

    def update_status(self, run_id, created_at, status, results=None):
        """Update test run status"""
        update_expr = 'SET #status = :status, completed_at = :completed_at, #duration = :duration'
        expr_values = {
            ':status': status,
            ':completed_at': datetime.utcnow().isoformat() + 'Z',
            ':duration': 0  # Calculate actual duration
        }
        expr_names = {
            '#status': 'status',
            '#duration': 'duration_seconds'
        }

        if results:
            update_expr += ', results_summary = :results'
            expr_values[':results'] = results

        self.table.update_item(
            Key={'run_id': run_id, 'created_at': created_at},
            UpdateExpression=update_expr,
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values
        )

    def get_run(self, run_id, created_at):
        """Fetch single test run"""
        response = self.table.get_item(Key={'run_id': run_id, 'created_at': created_at})
        return response.get('Item')

    def list_runs(self, limit=10):
        """Query recent test runs, sorted by created_at descending"""
        response = self.table.scan(Limit=limit)
        items = response.get('Items', [])
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return items


class TestReportsDB:
    """DynamoDB operations for test reports"""

    def __init__(self, dynamodb_resource):
        self.table = dynamodb_resource.Table(
            os.environ.get('TEST_REPORTS_TABLE', 'qa-portal-test-reports')
        )

    def create_report(self, data):
        """Create new report record"""
        ttl = int((datetime.utcnow() + timedelta(days=180)).timestamp())
        data['ttl'] = ttl
        self.table.put_item(Item=data)
        return data.get('report_id')

    def get_report(self, report_id):
        """Fetch single report"""
        response = self.table.get_item(Key={'report_id': report_id})
        return response.get('Item')

    def list_reports_by_run(self, run_id):
        """Query reports for a test run"""
        response = self.table.query(
            IndexName='run_id-index',
            KeyConditionExpression='run_id = :run_id',
            ExpressionAttributeValues={':run_id': run_id}
        )
        return response.get('Items', [])
