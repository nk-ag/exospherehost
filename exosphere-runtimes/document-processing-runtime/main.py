from dotenv import load_dotenv
from exospherehost import Runtime
from nodes.parse_pdf_document import ParsePDFDocumentNode
from nodes.preprocess_markdown_text import PreprocessMarkdownTextNode
from nodes.preprocess_tables import PreprocessTablesNode
from nodes.analyze_image_content import AnalyzeImageContentNode
from nodes.generate_image_descriptions import GenerateImageDescriptionsNode
from nodes.deduplicate_images import DeduplicateImagesNode
from nodes.create_extracted_document import CreateExtractedDocumentNode
from nodes.chunk_document import ChunkDocumentNode
from nodes.generate_question import GenerateQuestionNode
from nodes.generate_answer import GenerateAnswerNode
from nodes.verify_answer import VerifyAnswerNode
from nodes.create_final_report import CreateFinalReportNode

# Load environment variables from .env file
# EXOSPHERE_STATE_MANAGER_URI is the URI of the state manager
# EXOSPHERE_API_KEY is the key of the runtime
load_dotenv()

# Note on node ordering:
# The order of node classes in the `nodes` list does not define execution sequence.
# Nodes are registered with the state manager; orchestration and dependencies are handled externally.
# Nodes are listed in logical processing order for readability only.
Runtime(
    name="document-processing-runtime",
    namespace="document-processing",
    nodes=[
        ParsePDFDocumentNode,
        PreprocessMarkdownTextNode,
        PreprocessTablesNode,
        AnalyzeImageContentNode,
        GenerateImageDescriptionsNode,
        DeduplicateImagesNode,
        CreateExtractedDocumentNode,
        ChunkDocumentNode,
        GenerateQuestionNode,
        GenerateAnswerNode,
        VerifyAnswerNode,
        CreateFinalReportNode
    ]
).start()
