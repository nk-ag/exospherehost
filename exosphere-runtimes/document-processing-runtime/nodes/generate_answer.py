import json
import requests
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any


class GenerateAnswerNode(BaseNode):

    class Inputs(BaseModel):
        source_chunk: str
        generated_question: str

    class Outputs(BaseModel):
        generated_answer: str
        question: str
        source_chunk: str

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Generate an answer to a question based on document chunk using AI.
        """
        
        # Use OpenAI API to generate answers
        headers = {
            "Authorization": f"Bearer {self.secrets.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {
                "role": "system",
                "content": "You are an expert at answering questions based on document content. Provide accurate, relevant answers using only the information provided in the document chunk."
            },
            {
                "role": "user",
                "content": f"Document chunk:\n{self.inputs.source_chunk}\n\nQuestion: {self.inputs.generated_question}\n\nAnswer:"
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
            
            answer = response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            # Fallback answer if API call fails
            answer = "Based on the provided document chunk, I cannot generate a specific answer at this time."
            print(f"OpenAI API call failed: {e}")
        
        return self.Outputs(
            generated_answer=answer,
            question=self.inputs.generated_question,
            source_chunk=self.inputs.source_chunk
        )
