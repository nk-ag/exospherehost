import json
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any, List


class ChunkDocumentNode(BaseNode):

    class Inputs(BaseModel):
        extracted_document: str

    class Outputs(BaseModel):
        document_chunks: List[str]
        chunk_count: int

    class Secrets(BaseModel):
        pass  # No secrets required for chunking

    async def execute(self) -> Outputs:
        """
        Split the extracted document into manageable chunks.
        """
        
        # Simple chunking by sections
        # In practice, you'd use more sophisticated chunking strategies
        chunks = self.inputs.extracted_document.split("\n\n")
        chunks = [chunk.strip() for chunk in chunks if chunk.strip()]
        
        # Ensure minimum chunk size and merge small chunks
        processed_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            if len(current_chunk) + len(chunk) < 1000:  # Merge chunks under 1000 chars
                current_chunk += "\n\n" + chunk if current_chunk else chunk
            else:
                if current_chunk:
                    processed_chunks.append(current_chunk)
                current_chunk = chunk
        
        # Add the last chunk
        if current_chunk:
            processed_chunks.append(current_chunk)
        
        return self.Outputs(
            document_chunks=processed_chunks,
            chunk_count=len(processed_chunks)
        )
