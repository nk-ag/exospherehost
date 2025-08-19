import json
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import List, Dict, Any


class ChunkDocumentNode(BaseNode):

    class Inputs(BaseModel):
        extracted_content: str
        key: str
        chunk_size: str = "1000"
        overlap: str = "200"

    class Outputs(BaseModel):
        chunk: Dict[str, Any]
        
    class Secrets(BaseModel):
        pass

    async def execute(self) :
        """
        Split document content into chunks for processing.
        """
        
        # Convert string inputs to appropriate types
        chunk_size = int(self.inputs.chunk_size)
        overlap = int(self.inputs.overlap)
        
        content = self.inputs.extracted_content
        chunks = []
        
        # Simple chunking by character count
        # In production, you might want more sophisticated chunking
        start = 0
        chunk_id = 0
        
        while start < len(content):
            end = min(start + chunk_size, len(content))
            chunk_text = content[start:end]
            
            chunk = {
                "chunk_id": chunk_id,
                "content": chunk_text,
                "start_pos": start,
                "end_pos": end,
                "key": self.inputs.key
            }
            
            chunks.append(chunk)
            chunk_id += 1
            start = end - overlap if end < len(content) else end
        
        return [
            self.Outputs(chunk = chunk)
            for chunk in chunks
        ] 
