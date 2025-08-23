"""
Integration tests for the api-server.

These tests cover the complete api-server workflow:
1. Create a user
2. Authenticate and get tokens
3. Create a project
4. Manage project permissions and billing

Prerequisites:
- A running MongoDB instance
- A running Redis instance
- The api-server service running on localhost:8000
"""

import sys
import os
import pytest
import asyncio
import httpx
import uuid

# Add the api-server app to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.user.models.create_user_request import CreateUserRequest
from app.auth.models.token_request import TokenRequest
from app.auth.models.refresh_token_request import RefreshTokenRequest
from app.project.models.create_project_request import CreateProjectRequest

# Mark all tests as integration tests
pytestmark = pytest.mark.integration


class TestApiServerIntegration:
    """Integration tests for the complete api-server workflow."""
    
    @pytest.fixture
    async def api_server_client(self):
        """Create an HTTP client for the api-server."""
        base_url = os.environ.get("API_SERVER_BASE_URL", "http://localhost:8000")  
        async with httpx.AsyncClient(base_url=base_url) as client:
            yield client
    
    @pytest.fixture
    def test_user_email(self) -> str:
        """Generate a unique test user email."""
        return f"test-user-{uuid.uuid4().hex[:8]}@example.com"
    
    @pytest.fixture
    def test_user_password(self) -> str:
        """Generate a test user password."""
        return "TestPassword123!"
    
    @pytest.fixture
    def test_project_name(self) -> str:
        """Generate a unique test project name."""
        return f"test-project-{uuid.uuid4().hex[:8]}"
    
    @pytest.fixture
    def test_project_description(self) -> str:
        """Generate a test project description."""
        return "Test project for integration testing"
    
    async def test_health_check(self, api_server_client):
        """Test the health check endpoint."""
        
        response = await api_server_client.get("/health")
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["message"] == "OK"
        print("✅ Health check passed")
    
    async def test_create_user(self, api_server_client, test_user_email: str, test_user_password: str):
        """Test creating a new user."""
        
        # Prepare the request
        request_data = CreateUserRequest(
            email=test_user_email,
            password=test_user_password,
            first_name="Test",
            last_name="User"
        )
        
        # Make the request
        response = await api_server_client.post(
            "/user/create",
            json=request_data.model_dump()
        )
        
        # Verify the response
        assert response.status_code == 200
        response_data = response.json()
        assert "user_id" in response_data
        assert "email" in response_data
        assert response_data["email"] == test_user_email
        assert "status" in response_data
        assert "created_at" in response_data
        
        print(f"✅ User created successfully: {test_user_email}")
        return response_data["user_id"]
    
    async def test_create_token(self, api_server_client, test_user_email: str, test_user_password: str):
        """Test creating authentication tokens."""
        
        # Prepare the request
        request_data = TokenRequest(
            email=test_user_email,
            password=test_user_password
        )
        
        # Make the request
        response = await api_server_client.post(
            "/auth/token",
            json=request_data.model_dump()
        )
        
        # Verify the response
        assert response.status_code == 200
        response_data = response.json()
        assert "access_token" in response_data
        assert "refresh_token" in response_data
        assert "token_type" in response_data
        assert response_data["token_type"] == "bearer"
        assert "expires_in" in response_data
        
        print(f"✅ Token created successfully for user: {test_user_email}")
        return response_data["access_token"], response_data["refresh_token"]
    
    async def test_refresh_access_token(self, api_server_client, refresh_token: str):
        """Test refreshing an access token."""
        
        # Prepare the request
        request_data = RefreshTokenRequest(
            refresh_token=refresh_token
        )
        
        # Make the request
        response = await api_server_client.post(
            "/auth/refresh",
            json=request_data.model_dump()
        )
        
        # Verify the response
        assert response.status_code == 200
        response_data = response.json()
        assert "access_token" in response_data
        assert "token_type" in response_data
        assert response_data["token_type"] == "bearer"
        assert "expires_in" in response_data
        
        print("✅ Access token refreshed successfully")
        return response_data["access_token"]
    
    async def test_create_project(self, api_server_client, access_token: str, 
                                test_project_name: str, test_project_description: str):
        """Test creating a new project."""
        
        # Prepare the request
        request_data = CreateProjectRequest(
            name=test_project_name,
            description=test_project_description
        )
        
        # Make the request with authentication
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await api_server_client.post(
            "/project/create",
            json=request_data.model_dump(),
            headers=headers
        )
        
        # Verify the response
        assert response.status_code == 200
        response_data = response.json()
        assert "project_id" in response_data
        assert "name" in response_data
        assert response_data["name"] == test_project_name
        assert "description" in response_data
        assert response_data["description"] == test_project_description
        assert "status" in response_data
        assert "created_at" in response_data
        assert "billing_account" in response_data
        
        print(f"✅ Project created successfully: {test_project_name}")
        return response_data["project_id"]
    
    async def test_get_project_details(self, api_server_client, access_token: str, project_id: str):
        """Test retrieving project details."""
        
        # Make the request with authentication
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await api_server_client.get(
            f"/project/{project_id}",
            headers=headers
        )
        
        # Verify the response
        assert response.status_code == 200
        response_data = response.json()
        assert "project_id" in response_data
        assert "name" in response_data
        assert "description" in response_data
        assert "status" in response_data
        assert "created_at" in response_data
        assert "billing_account" in response_data
        
        print(f"✅ Project details retrieved successfully: {response_data['name']}")
    
    async def test_full_user_workflow(self, api_server_client, test_user_email: str, 
                                    test_user_password: str, test_project_name: str,
                                    test_project_description: str):
        """Test the complete user workflow."""
        
        # Step 1: Create a user
        user_id = await self.test_create_user(
            api_server_client, test_user_email, test_user_password
        )
        
        # Step 2: Create authentication tokens
        access_token, refresh_token = await self.test_create_token(
            api_server_client, test_user_email, test_user_password
        )
        
        # Step 3: Create a project
        project_id = await self.test_create_project(
            api_server_client, access_token, test_project_name, test_project_description
        )
        
        # Step 4: Get project details
        await self.test_get_project_details(
            api_server_client, access_token, project_id
        )
        
        # Step 5: Refresh the access token
        new_access_token = await self.test_refresh_access_token(
            api_server_client, refresh_token
        )
        
        # Step 6: Verify the new token works by getting project details again
        await self.test_get_project_details(
            api_server_client, new_access_token, project_id
        )
        
        print("🎉 Complete user workflow completed successfully!")
        print(f"   - User ID: {user_id}")
        print(f"   - User Email: {test_user_email}")
        print(f"   - Project ID: {project_id}")
        print(f"   - Project Name: {test_project_name}")


class TestApiServerErrorHandling:
    """Integration tests for error handling in the api-server."""
    
    @pytest.fixture
    async def api_server_client(self):
        """Create an HTTP client for the api-server."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            yield client
    
    async def test_create_user_with_invalid_email(self, api_server_client):
        """Test creating a user with an invalid email."""
        
        request_data = CreateUserRequest(
            email="invalid-email",
            password="TestPassword123!",
            first_name="Test",
            last_name="User"
        )
        
        response = await api_server_client.post(
            "/user/create",
            json=request_data.model_dump()
        )
        
        # Should return a validation error
        assert response.status_code == 422
        print("✅ Invalid email validation working correctly")
    
    async def test_create_user_with_weak_password(self, api_server_client):
        """Test creating a user with a weak password."""
        
        request_data = CreateUserRequest(
            email="test@example.com",
            password="weak",
            first_name="Test",
            last_name="User"
        )
        
        response = await api_server_client.post(
            "/user/create",
            json=request_data.model_dump()
        )
        
        # Should return a validation error
        assert response.status_code == 422
        print("✅ Weak password validation working correctly")
    
    async def test_create_token_with_invalid_credentials(self, api_server_client):
        """Test creating tokens with invalid credentials."""
        
        request_data = TokenRequest(
            email="nonexistent@example.com",
            password="wrongpassword"
        )
        
        response = await api_server_client.post(
            "/auth/token",
            json=request_data.model_dump()
        )
        
        # Should return an authentication error
        assert response.status_code == 401
        print("✅ Invalid credentials handling working correctly")
    
    async def test_create_project_without_authentication(self, api_server_client):
        """Test creating a project without authentication."""
        
        request_data = CreateProjectRequest(
            name="Test Project",
            description="Test Description"
        )
        
        response = await api_server_client.post(
            "/project/create",
            json=request_data.model_dump()
        )
        
        # Should return an authentication error
        assert response.status_code == 401
        print("✅ Authentication required working correctly")
    
    async def test_create_project_with_invalid_token(self, api_server_client):
        """Test creating a project with an invalid token."""
        
        request_data = CreateProjectRequest(
            name="Test Project",
            description="Test Description"
        )
        
        headers = {"Authorization": "Bearer invalid-token"}
        response = await api_server_client.post(
            "/project/create",
            json=request_data.model_dump(),
            headers=headers
        )
        
        # Should return an authentication error
        assert response.status_code == 401
        print("✅ Invalid token handling working correctly")


class TestApiServerConcurrentOperations:
    """Integration tests for concurrent operations in the api-server."""
    
    @pytest.fixture
    async def api_server_client(self):
        """Create an HTTP client for the api-server."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            yield client
    
    async def test_concurrent_user_creation(self, api_server_client):
        """Test creating multiple users concurrently."""
        
        async def create_user(user_id: int):
            email = f"concurrent-user-{user_id}-{uuid.uuid4().hex[:8]}@example.com"
            request_data = CreateUserRequest(
                email=email,
                password="TestPassword123!",
                first_name=f"User{user_id}",
                last_name="Concurrent"
            )
            
            response = await api_server_client.post(
                "/user/create",
                json=request_data.model_dump()
            )
            
            assert response.status_code == 200
            return response.json()["user_id"]
        
        # Create 5 users concurrently
        tasks = [create_user(i) for i in range(5)]
        user_ids = await asyncio.gather(*tasks)
        
        assert len(user_ids) == 5
        assert len(set(user_ids)) == 5  # All IDs should be unique
        
        print(f"✅ Concurrent user creation successful: {len(user_ids)} users created")
    
    async def test_concurrent_project_creation(self, api_server_client):
        """Test creating multiple projects concurrently for the same user."""
        
        # First create a user and get tokens
        email = f"concurrent-project-user-{uuid.uuid4().hex[:8]}@example.com"
        
        # Create user
        user_request = CreateUserRequest(
            email=email,
            password="TestPassword123!",
            first_name="Concurrent",
            last_name="ProjectUser"
        )
        
        user_response = await api_server_client.post(
            "/user/create",
            json=user_request.model_dump()
        )
        assert user_response.status_code == 200
        
        # Get tokens
        token_request = TokenRequest(
            email=email,
            password="TestPassword123!"
        )
        
        token_response = await api_server_client.post(
            "/auth/token",
            json=token_request.model_dump()
        )
        assert token_response.status_code == 200
        
        access_token = token_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async def create_project(project_id: int):
            request_data = CreateProjectRequest(
                name=f"Concurrent Project {project_id}",
                description=f"Test concurrent project {project_id}"
            )
            
            response = await api_server_client.post(
                "/project/create",
                json=request_data.model_dump(),
                headers=headers
            )
            
            assert response.status_code == 200
            return response.json()["project_id"]
        
        # Create 3 projects concurrently
        tasks = [create_project(i) for i in range(3)]
        project_ids = await asyncio.gather(*tasks)
        
        assert len(project_ids) == 3
        assert len(set(project_ids)) == 3  # All IDs should be unique
        
        print(f"✅ Concurrent project creation successful: {len(project_ids)} projects created")


if __name__ == "__main__":
    # Run the tests
    pytest.main([__file__, "-v", "-s"])
