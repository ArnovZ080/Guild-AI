import httpx
import pytest
import time

# Base URL of the running API server
# For local testing, this would be http://localhost:5000
# The test assumes the server is running.
BASE_URL = "http://localhost:5000"

@pytest.fixture(scope="module")
def client():
    # Use httpx.Client for synchronous tests. For async tests, use httpx.AsyncClient.
    with httpx.Client(base_url=BASE_URL, timeout=15) as client:
        yield client

def test_health_check(client: httpx.Client):
    """
    Test if the root endpoint is reachable.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Guild API Server is running."}

def test_full_workflow_execution_flow(client: httpx.Client):
    """
    Tests the full pipeline:
    1. Create a contract.
    2. Execute the contract's workflow.
    3. Poll for the workflow status until it's complete.
    """
    # 1. Create a new contract
    contract_data = {
        "title": "Test Marketing Campaign",
        "objective": "Create a test campaign for a new product.",
        "deliverables": ["ad_copy", "blog_post"],
        "data_rooms": ["room-123"],
        "rubric": {
            "quality_threshold": 0.75,
            "criteria": [
                {
                    "name": "Clarity",
                    "description": "Is the content clear and concise?",
                    "weight": 0.5
                },
                {
                    "name": "Brand Voice",
                    "description": "Does it match the brand voice?",
                    "weight": 0.5
                }
            ]
        }
    }

    create_response = client.post("/workflows/contracts", json=contract_data)
    assert create_response.status_code == 201
    contract = create_response.json()
    assert contract["id"] is not None
    assert contract["title"] == "Test Marketing Campaign"
    contract_id = contract["id"]

    # 2. Execute the workflow
    execute_response = client.post(f"/workflows/contracts/{contract_id}/execute")
    assert execute_response.status_code == 202
    execute_data = execute_response.json()
    assert execute_data["message"] == "Workflow execution started in the background."
    workflow_id = execute_data["workflow_id"]

    # 3. Poll for status
    max_retries = 15
    retry_interval = 1 # seconds

    workflow_status = None
    for i in range(max_retries):
        print(f"Polling attempt {i+1}/{max_retries} for workflow {workflow_id}...")
        status_response = client.get(f"/workflows/{workflow_id}/status")
        assert status_response.status_code == 200
        workflow_status = status_response.json()

        if workflow_status["status"] == "completed":
            break

        time.sleep(retry_interval)

    assert workflow_status is not None, "Workflow status was never retrieved."
    assert workflow_status["status"] == "completed", f"Workflow did not complete in time. Final status: {workflow_status['status']}"
    print("Workflow completed successfully!")
