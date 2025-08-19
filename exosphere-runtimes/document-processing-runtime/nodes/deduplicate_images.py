import json
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any, List


class DeduplicateImagesNode(BaseNode):

    class Inputs(BaseModel):
        image_descriptions: List[Dict[str, Any]]

    class Outputs(BaseModel):
        unique_image_descriptions: List[Dict[str, Any]]

    class Secrets(BaseModel):
        pass  # No secrets required for deduplication

    async def execute(self) -> Outputs:
        """
        Remove duplicate images using description similarity.
        """
        
        unique_descriptions = []
        seen_descriptions = set()
        
        for img_desc in self.inputs.image_descriptions:
            description = img_desc.get("description", "")
            
            # Simple hash-based deduplication
            # In production, you might use more sophisticated similarity algorithms
            desc_hash = hash(description.lower().strip())
            
            if desc_hash not in seen_descriptions:
                seen_descriptions.add(desc_hash)
                unique_descriptions.append(img_desc)
        
        return self.Outputs(
            unique_image_descriptions=unique_descriptions
        )
