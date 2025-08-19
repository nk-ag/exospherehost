import json
import requests
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any


class PreprocessMarkdownTextNode(BaseNode):

    class Inputs(BaseModel):
        extracted_content: Dict[str, Any]

    class Outputs(BaseModel):
        cleaned_markdown: str
        original_text: str

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Preprocess and clean markdown text, remove PII using OpenAI API.
        """
        
        # Extract markdown text from the extracted content
        markdown_text = self.inputs.extracted_content.get("markdown_text", "")
        
        # Clean text using OpenAI API
        headers = {
            "Authorization": f"Bearer {self.secrets.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {
                "role": "system", 
                "content": "You are a text cleaning assistant. Clean the following markdown text by removing unnecessary formatting, fixing typos, and ensuring proper structure. Also remove any PII (email addresses, phone numbers, etc.) by replacing them with [REDACTED]."
            },
            {
                "role": "user", 
                "content": f"Clean this markdown text:\n\n{markdown_text}"
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
            
            cleaned_text = response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            # Fallback to original text if API call fails
            cleaned_text = markdown_text
            print(f"OpenAI API call failed: {e}")
        
        return self.Outputs(
            cleaned_markdown=cleaned_text,
            original_text=markdown_text
        )
