import json
import requests
import base64
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any, List


class AnalyzeImageContentNode(BaseNode):

    class Inputs(BaseModel):
        extracted_content: Dict[str, Any]

    class Outputs(BaseModel):
        content_images: List[Dict[str, Any]]
        logo_images: List[Dict[str, Any]]

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Analyze images to determine if they are logos/symbols or content-bearing.
        """
        
        # Extract images from the extracted content
        images = self.inputs.extracted_content.get("images", [])
        
        content_images = []
        logo_images = []
        
        for image_info in images:
            image_path = image_info.get("path", "")
            image_type = image_info.get("type", "unknown")
            
            # Use OpenAI Vision API to analyze image
            headers = {
                "Authorization": f"Bearer {self.secrets.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            # For this example, we'll simulate the analysis
            # In a real implementation, you would:
            # 1. Read the image file
            # 2. Convert to base64
            # 3. Send to OpenAI Vision API
            
            try:
                # Simulate API call (replace with actual implementation)
                analysis = "content-bearing image with technical diagrams"
                
                # Determine if it's a logo/symbol or content-bearing
                if any(keyword in analysis.lower() for keyword in ["logo", "symbol", "header", "footer", "brand"]):
                    logo_images.append({
                        "path": image_path,
                        "analysis": analysis,
                        "type": image_type
                    })
                else:
                    content_images.append({
                        "path": image_path,
                        "analysis": analysis,
                        "type": image_type
                    })
                    
            except Exception as e:
                # Fallback: use the type from extracted content
                if image_type in ["logo", "symbol", "header", "footer"]:
                    logo_images.append({
                        "path": image_path,
                        "analysis": f"Classified as {image_type}",
                        "type": image_type
                    })
                else:
                    content_images.append({
                        "path": image_path,
                        "analysis": f"Classified as {image_type}",
                        "type": image_type
                    })
        
        return self.Outputs(
            content_images=content_images,
            logo_images=logo_images
        )
