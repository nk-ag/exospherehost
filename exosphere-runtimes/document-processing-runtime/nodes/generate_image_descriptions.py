import json
import requests
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any, List


class GenerateImageDescriptionsNode(BaseNode):

    class Inputs(BaseModel):
        content_images: List[Dict[str, Any]]

    class Outputs(BaseModel):
        image_descriptions: List[Dict[str, Any]]

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Generate descriptions for content-bearing images using AI.
        """
        
        descriptions = []
        
        for image_info in self.inputs.content_images:
            image_path = image_info.get("path", "")
            image_analysis = image_info.get("analysis", "")
            
            # Use OpenAI API to generate detailed description
            headers = {
                "Authorization": f"Bearer {self.secrets.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            messages = [
                {
                    "role": "system",
                    "content": "You are a vision language model. Provide a detailed, accurate description of the image content that would be useful for document understanding and question answering."
                },
                {
                    "role": "user",
                    "content": f"Based on this image analysis: '{image_analysis}', provide a detailed description of the image content:"
                }
            ]
            
            payload = {
                "model": "gpt-4",
                "messages": messages,
                "temperature": 0.3
            }
            
            try:
                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                description = response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                # Fallback to analysis if API call fails
                description = image_analysis
                print(f"OpenAI API call failed: {e}")
            
            descriptions.append({
                "image_path": image_path,
                "description": description,
                "analysis": image_analysis
            })
        
        return self.Outputs(
            image_descriptions=descriptions
        )
