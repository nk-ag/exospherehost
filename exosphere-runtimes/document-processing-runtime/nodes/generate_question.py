import json
import requests
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any, List


class GenerateQuestionNode(BaseNode):

    class Inputs(BaseModel):
        chunk: str

    class Outputs(BaseModel):
        generated_question: str
        source_chunk: str

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Generate a question based on a document chunk using AI.
        """
        
        # Use OpenAI API to generate questions
        headers = {
            "Authorization": f"Bearer {self.secrets.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {
                "role": "system",
                "content": "You are an expert at generating relevant questions based on document content. Generate a specific, answerable question that could be asked about the given document chunk."
            },
            {
                "role": "user",
                "content": f"Generate a question based on this document chunk:\n\n{self.inputs.chunk}"
            }
        ]
        
        payload = {
            "model": "gpt-4",
            "messages": messages,
            "temperature": 0.7
        }
        
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            question = response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            # Fallback question if API call fails
            question = "What is the main topic discussed in this document section?"
            print(f"OpenAI API call failed: {e}")
        
        return self.Outputs(
            generated_question=question,
            source_chunk=self.inputs.chunk
        )
