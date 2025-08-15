import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from app.controller.upsert_graph_template import upsert_graph_template
from app.models.graph_models import UpsertGraphTemplateRequest
from app.models.graph_template_validation_status import GraphTemplateValidationStatus


class TestUpsertGraphTemplate:
    """Test cases for upsert_graph_template function"""

    @pytest.fixture
    def mock_request_id(self):
        return "test-request-id"

    @pytest.fixture
    def mock_namespace(self):
        return "test_namespace"

    @pytest.fixture
    def mock_graph_name(self):
        return "test_graph"

    @pytest.fixture
    def mock_background_tasks(self):
        return MagicMock()

    @pytest.fixture
    def mock_nodes(self):
        return [
            {"id": "node1", "name": "Test Node 1", "type": "input"},
            {"id": "node2", "name": "Test Node 2", "type": "output"}
        ]

    @pytest.fixture
    def mock_secrets(self):
        return {
            "api_key": "encrypted_api_key",
            "database_url": "encrypted_db_url"
        }

    @pytest.fixture
    def mock_upsert_request(self, mock_nodes, mock_secrets):
        return UpsertGraphTemplateRequest(
            nodes=mock_nodes,
            secrets=mock_secrets
        )

    @pytest.fixture
    def mock_existing_template(self, mock_nodes, mock_secrets):
        template = MagicMock()
        template.nodes = mock_nodes
        template.validation_status = GraphTemplateValidationStatus.VALID
        template.validation_errors = []
        template.secrets = mock_secrets
        template.created_at = datetime(2023, 1, 1, 12, 0, 0)
        template.updated_at = datetime(2023, 1, 2, 12, 0, 0)
        template.get_secrets.return_value = mock_secrets
        template.set_secrets.return_value = template
        return template

    @patch('app.controller.upsert_graph_template.GraphTemplate')
    @patch('app.controller.upsert_graph_template.verify_graph')
    async def test_upsert_graph_template_update_existing(
        self,
        mock_verify_graph,
        mock_graph_template_class,
        mock_namespace,
        mock_graph_name,
        mock_upsert_request,
        mock_existing_template,
        mock_background_tasks,
        mock_request_id
    ):
        """Test successful update of existing graph template"""
        # Arrange
        mock_graph_template_class.find_one = AsyncMock(return_value=mock_existing_template)

        # Act
        result = await upsert_graph_template(
            mock_namespace,
            mock_graph_name,
            mock_upsert_request,
            mock_request_id,
            mock_background_tasks
        )

        # Assert
        assert result.nodes == mock_upsert_request.nodes
        assert result.validation_status == GraphTemplateValidationStatus.PENDING
        assert result.validation_errors == []
        assert result.secrets == {"api_key": True, "database_url": True}
        assert result.created_at == mock_existing_template.created_at
        assert result.updated_at == mock_existing_template.updated_at

        # Verify template was updated
        mock_existing_template.set_secrets.assert_called_once_with(mock_upsert_request.secrets)
        mock_existing_template.update.assert_called_once()
        
        # Verify background task was added
        mock_background_tasks.add_task.assert_called_once_with(mock_verify_graph, mock_existing_template)

    @patch('app.controller.upsert_graph_template.GraphTemplate')
    @patch('app.controller.upsert_graph_template.verify_graph')
    async def test_upsert_graph_template_create_new(
        self,
        mock_verify_graph,
        mock_graph_template_class,
        mock_namespace,
        mock_graph_name,
        mock_upsert_request,
        mock_background_tasks,
        mock_request_id
    ):
        """Test successful creation of new graph template"""
        # Arrange
        mock_graph_template_class.find_one = AsyncMock(return_value=None)  # Template doesn't exist
        
        mock_new_template = MagicMock()
        mock_new_template.nodes = mock_upsert_request.nodes
        mock_new_template.validation_status = GraphTemplateValidationStatus.PENDING
        mock_new_template.validation_errors = []
        mock_new_template.secrets = mock_upsert_request.secrets
        mock_new_template.created_at = datetime(2023, 1, 1, 12, 0, 0)
        mock_new_template.updated_at = datetime(2023, 1, 1, 12, 0, 0)
        mock_new_template.get_secrets.return_value = mock_upsert_request.secrets
        mock_new_template.set_secrets.return_value = mock_new_template
        
        mock_graph_template_class.insert = AsyncMock(return_value=mock_new_template)

        # Act
        result = await upsert_graph_template(
            mock_namespace,
            mock_graph_name,
            mock_upsert_request,
            mock_request_id,
            mock_background_tasks
        )

        # Assert
        assert result.nodes == mock_upsert_request.nodes
        assert result.validation_status == GraphTemplateValidationStatus.PENDING
        assert result.validation_errors == []
        assert result.secrets == {"api_key": True, "database_url": True}

        # Verify new template was created
        mock_graph_template_class.insert.assert_called_once()
        
        # Verify background task was added
        mock_background_tasks.add_task.assert_called_once_with(mock_verify_graph, mock_new_template)

    @patch('app.controller.upsert_graph_template.GraphTemplate')
    async def test_upsert_graph_template_database_error(
        self,
        mock_graph_template_class,
        mock_namespace,
        mock_graph_name,
        mock_upsert_request,
        mock_background_tasks,
        mock_request_id
    ):
        """Test handling of database errors"""
        # Arrange
        mock_graph_template_class.find_one = AsyncMock(side_effect=Exception("Database error"))

        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            await upsert_graph_template(
                mock_namespace,
                mock_graph_name,
                mock_upsert_request,
                mock_request_id,
                mock_background_tasks
            )
        
        assert str(exc_info.value) == "Database error"

    @patch('app.controller.upsert_graph_template.GraphTemplate')
    @patch('app.controller.upsert_graph_template.verify_graph')
    async def test_upsert_graph_template_with_empty_nodes(
        self,
        mock_verify_graph,
        mock_graph_template_class,
        mock_namespace,
        mock_graph_name,
        mock_background_tasks,
        mock_request_id
    ):
        """Test upsert with empty nodes list"""
        # Arrange
        upsert_request = UpsertGraphTemplateRequest(
            nodes=[],
            secrets={}
        )
        
        mock_existing_template = MagicMock()
        mock_existing_template.nodes = []
        mock_existing_template.validation_status = GraphTemplateValidationStatus.VALID
        mock_existing_template.validation_errors = []
        mock_existing_template.secrets = {}
        mock_existing_template.created_at = datetime(2023, 1, 1, 12, 0, 0)
        mock_existing_template.updated_at = datetime(2023, 1, 2, 12, 0, 0)
        mock_existing_template.get_secrets.return_value = {}
        mock_existing_template.set_secrets.return_value = mock_existing_template
        
        mock_graph_template_class.find_one = AsyncMock(return_value=mock_existing_template)

        # Act
        result = await upsert_graph_template(
            mock_namespace,
            mock_graph_name,
            upsert_request,
            mock_request_id,
            mock_background_tasks
        )

        # Assert
        assert result.nodes == []
        assert result.validation_status == GraphTemplateValidationStatus.PENDING
        assert result.validation_errors == []
        assert result.secrets == {}

    @patch('app.controller.upsert_graph_template.GraphTemplate')
    @patch('app.controller.upsert_graph_template.verify_graph')
    async def test_upsert_graph_template_with_complex_nodes(
        self,
        mock_verify_graph,
        mock_graph_template_class,
        mock_namespace,
        mock_graph_name,
        mock_background_tasks,
        mock_request_id
    ):
        """Test upsert with complex node structure"""
        # Arrange
        from app.models.node_template_model import NodeTemplate
        
        complex_nodes = [
            NodeTemplate(
                identifier="input_node",
                node_name="Input Node",
                namespace="test_namespace",
                inputs={"source": "file", "format": "json"},
                next_nodes=["process_node"]
            ),
            NodeTemplate(
                identifier="process_node",
                node_name="Process Node",
                namespace="test_namespace",
                inputs={"operation": "filter", "conditions": [{"field": "status", "value": "active"}]},
                next_nodes=["output_node"]
            ),
            NodeTemplate(
                identifier="output_node",
                node_name="Output Node",
                namespace="test_namespace",
                inputs={"destination": "database", "table": "results"},
                next_nodes=[]
            )
        ]

        complex_secrets = {
            "database_connection": "encrypted_db_conn",
            "api_credentials": "encrypted_api_creds",
            "ssl_certificate": "encrypted_ssl_cert"
        }
    
        upsert_request = UpsertGraphTemplateRequest(
            nodes=complex_nodes,
            secrets=complex_secrets
        )
        
        mock_existing_template = MagicMock()
        mock_existing_template.nodes = complex_nodes
        mock_existing_template.validation_status = GraphTemplateValidationStatus.VALID
        mock_existing_template.validation_errors = []
        mock_existing_template.secrets = complex_secrets
        mock_existing_template.created_at = datetime(2023, 1, 1, 12, 0, 0)
        mock_existing_template.updated_at = datetime(2023, 1, 2, 12, 0, 0)
        mock_existing_template.get_secrets.return_value = complex_secrets
        mock_existing_template.set_secrets.return_value = mock_existing_template
        
        mock_graph_template_class.find_one = AsyncMock(return_value=mock_existing_template)

        # Act
        result = await upsert_graph_template(
            mock_namespace,
            mock_graph_name,
            upsert_request,
            mock_request_id,
            mock_background_tasks
        )

        # Assert
        assert result.nodes == complex_nodes
        assert result.validation_status == GraphTemplateValidationStatus.PENDING
        assert result.validation_errors == []
        expected_secrets = {
            "database_connection": True,
            "api_credentials": True,
            "ssl_certificate": True
        }
        assert result.secrets == expected_secrets

    @patch('app.controller.upsert_graph_template.GraphTemplate')
    @patch('app.controller.upsert_graph_template.verify_graph')
    async def test_upsert_graph_template_with_validation_errors(
        self,
        mock_verify_graph,
        mock_graph_template_class,
        mock_namespace,
        mock_graph_name,
        mock_upsert_request,
        mock_background_tasks,
        mock_request_id
    ):
        """Test upsert with existing validation errors"""
        # Arrange
        mock_existing_template = MagicMock()
        mock_existing_template.nodes = mock_upsert_request.nodes
        mock_existing_template.validation_status = GraphTemplateValidationStatus.INVALID
        mock_existing_template.validation_errors = ["Previous error 1", "Previous error 2"]
        mock_existing_template.secrets = mock_upsert_request.secrets
        mock_existing_template.created_at = datetime(2023, 1, 1, 12, 0, 0)
        mock_existing_template.updated_at = datetime(2023, 1, 2, 12, 0, 0)
        mock_existing_template.get_secrets.return_value = mock_upsert_request.secrets
        mock_existing_template.set_secrets.return_value = mock_existing_template
        
        mock_graph_template_class.find_one = AsyncMock(return_value=mock_existing_template)

        # Act
        result = await upsert_graph_template(
            mock_namespace,
            mock_graph_name,
            mock_upsert_request,
            mock_request_id,
            mock_background_tasks
        )

        # Assert
        assert result.validation_status == GraphTemplateValidationStatus.PENDING
        assert result.validation_errors == []  # Should be reset to empty
