import httpx
import pytest
import time
import os

# Use an environment variable for the base URL, with a fallback for local testing
BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")


@pytest.fixture(scope="module")
def client():
    # Use httpx.Client for synchronous tests. For async tests, use httpx.AsyncClient.
    with httpx.Client(base_url=BASE_URL, timeout=30) as client:
        # Wait for server to be ready
        max_retries = 5
        for i in range(max_retries):
            try:
                response = client.get("/health")
                if response.status_code == 200:
                    print("API Server is ready.")
                    break
            except httpx.ConnectError:
                print(f"Waiting for API server... (attempt {i+1}/{max_retries})")
                time.sleep(2)
        else:
            pytest.fail("API server did not become available in time.")


        yield client

def test_health_check(client: httpx.Client):
    """
    Test if the health check endpoint is reachable.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_full_workflow_execution_flow(client: httpx.Client):
    """
    Tests the full pipeline:
    1. Create a contract and get a workflow plan.
    2. Approve the workflow to start execution.
    3. Poll for the workflow status until it's complete.
    """
    # 1. Create a new contract and get a workflow plan
    contract_data = {
        "objective": "Develop a comprehensive marketing campaign for a new eco-friendly yoga mat.",
        "target_audience": {
            "description": "Environmentally conscious yoga practitioners aged 25-45.",
            "demographics": {
                "age": "25-45",
                "interests": ["Yoga", "Sustainability", "Wellness"]
            }
        },
        "additional_notes": "Focus on digital channels: SEO and paid ads on Instagram."

    }

    create_response = client.post("/workflows/contracts", json=contract_data)
    assert create_response.status_code == 201
    contract_response = create_response.json()

    assert "id" in contract_response
    assert "workflow_id" in contract_response
    assert "workflow_definition" in contract_response
    assert "tasks" in contract_response["workflow_definition"]

    workflow_id = contract_response["workflow_id"]
    print(f"Received workflow plan with ID: {workflow_id}")

    # 2. Approve the workflow to start execution
    approve_response = client.post(f"/workflows/{workflow_id}/approve")
    assert approve_response.status_code == 202
    approve_data = approve_response.json()
    assert approve_data["message"] == "Workflow execution started."

    # 3. Poll for status
    max_retries = 40  # Increased retries for potentially long-running AI tasks
    retry_interval = 5 # seconds


    workflow_status = None
    for i in range(max_retries):
        print(f"Polling attempt {i+1}/{max_retries} for workflow {workflow_id}...")
        status_response = client.get(f"/workflows/{workflow_id}/status")
        assert status_response.status_code == 200
        workflow_status = status_response.json()

        if workflow_status.get("status") == "completed":
            print("Workflow completed successfully!")
            break

        if workflow_status.get("status") == "failed":
            pytest.fail(f"Workflow failed. Final status: {workflow_status}")

        time.sleep(retry_interval)

    assert workflow_status is not None, "Workflow status was never retrieved."
    assert workflow_status.get("status") == "completed", f"Workflow did not complete in time. Final status: {workflow_status.get('status')}"

    # 4. Verify that executions were recorded
    assert "executions" in workflow_status
    assert len(workflow_status["executions"]) > 0
    # Check that a final "judge" agent ran and completed
    judge_executions = [ex for ex in workflow_status["executions"] if "Judge" in ex["agent_name"]]
    assert len(judge_executions) > 0
    assert all(ex["status"] == "completed" for ex in judge_executions)
    print("Verified that agent execution steps were recorded.")

