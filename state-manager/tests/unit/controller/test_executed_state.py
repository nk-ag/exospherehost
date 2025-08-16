import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException, status
from bson import ObjectId

from app.controller.executed_state import executed_state
from app.models.executed_models import ExecutedRequestModel
from app.models.state_status_enum import StateStatusEnum


class TestExecutedState:
    """Test cases for executed_state function"""

    @pytest.fixture
    def mock_request_id(self):
        return "test-request-id"

    @pytest.fixture
    def mock_namespace(self):
        return "test_namespace"

    @pytest.fixture
    def mock_state_id(self):
        return ObjectId()

    @pytest.fixture
    def mock_background_tasks(self):
        return MagicMock()

    @pytest.fixture
    def mock_state(self):
        state = MagicMock()
        state.id = ObjectId()
        state.status = StateStatusEnum.QUEUED
        state.node_name = "test_node"
        state.namespace_name = "test_namespace"
        state.identifier = "test_identifier"
        state.graph_name = "test_graph"
        state.inputs = {"key": "value"}
        state.parents = {}
        return state

    @pytest.fixture
    def mock_executed_request(self):
        return ExecutedRequestModel(
            outputs=[{"result": "success"}]
        )

    @patch('app.controller.executed_state.State')
    @patch('app.controller.executed_state.create_next_state')
    async def test_executed_state_success_single_output(
        self,
        mock_create_next_state,
        mock_state_class,
        mock_namespace,
        mock_state_id,
        mock_executed_request,
        mock_state,
        mock_background_tasks,
        mock_request_id
    ):
        """Test successful execution of state with single output"""
        # Arrange
        # Mock State.find_one() for finding the state
        # Mock State.find_one().set() for updating the state
        mock_update_query = MagicMock()
        mock_update_query.set = AsyncMock()

        mock_state.set = AsyncMock()

        mock_state.status = StateStatusEnum.QUEUED 
        mock_state_class.find_one = AsyncMock(return_value=mock_state)       
 

        # Act
        result = await executed_state(
            mock_namespace,
            mock_state_id,
            mock_executed_request,
            mock_request_id,
            mock_background_tasks
        )

        # Assert
        assert result.status == StateStatusEnum.EXECUTED
        assert mock_state_class.find_one.call_count == 2  # Called twice: once for finding, once for updating
        mock_update_query.set.assert_called_once()
        mock_background_tasks.add_task.assert_called_once_with(mock_create_next_state, mock_state)

    @patch('app.controller.executed_state.State')
    async def test_executed_state_not_found(
        self,
        mock_state_class,
        mock_namespace,
        mock_state_id,
        mock_executed_request,
        mock_background_tasks,
        mock_request_id
    ):
        """Test when state is not found"""
        # Arrange
        mock_state_class.find_one = AsyncMock(return_value=None)

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await executed_state(
                mock_namespace,
                mock_state_id,
                mock_executed_request,
                mock_request_id,
                mock_background_tasks
            )
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "State not found"

    @patch('app.controller.executed_state.State')
    async def test_executed_state_not_queued(
        self,
        mock_state_class,
        mock_namespace,
        mock_state_id,
        mock_executed_request,
        mock_background_tasks,
        mock_request_id
    ):
        """Test when state is not in QUEUED status"""
        # Arrange
        mock_state = MagicMock()
        mock_state.status = StateStatusEnum.CREATED  # Not QUEUED
        mock_state_class.find_one = AsyncMock(return_value=mock_state)

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await executed_state(
                mock_namespace,
                mock_state_id,
                mock_executed_request,
                mock_request_id,
                mock_background_tasks
            )
        
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "State is not queued"

   
    @patch('app.controller.executed_state.State')
    async def test_executed_state_database_error(
        self,
        mock_state_class,
        mock_namespace,
        mock_state_id,
        mock_executed_request,
        mock_background_tasks,
        mock_request_id
    ):
        """Test handling of database errors"""
        # Arrange
        mock_state_class.find_one = AsyncMock(side_effect=Exception("Database error"))

        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            await executed_state(
                mock_namespace,
                mock_state_id,
                mock_executed_request,
                mock_request_id,
                mock_background_tasks
            )
        
        assert str(exc_info.value) == "Database error"
