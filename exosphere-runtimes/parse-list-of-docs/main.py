from dotenv import load_dotenv
from exospherehost import Runtime
from nodes.list_s3_files import ListS3FilesNode
from nodes.parse_single_pdf import ParseSinglePDFNode
from nodes.chunk_document import ChunkDocumentNode
from nodes.generate_question import GenerateQuestionNode
from nodes.generate_answer import GenerateAnswerNode
from nodes.verify_answer import VerifyAnswerNode
from nodes.create_report import CreateReportNode
from nodes.upload_to_s3 import UploadToS3Node

# Load environment variables from .env file
# EXOSPHERE_STATE_MANAGER_URI is the URI of the state manager
# EXOSPHERE_API_KEY is the key of the runtime
load_dotenv()

# Note on node ordering:
# The order of node classes in the `nodes` list does not define execution sequence.
# Nodes are registered with the state manager; orchestration and dependencies are handled externally.
# Nodes are listed in logical processing order for readability only.
Runtime(
    name="parse-list-of-docs-runtime",
    namespace="parse-list-of-docs",
    nodes=[
        ListS3FilesNode,
        ParseSinglePDFNode,
        ChunkDocumentNode,
        GenerateQuestionNode,
        GenerateAnswerNode,
        VerifyAnswerNode,
        CreateReportNode,
        UploadToS3Node
    ]
).start()
