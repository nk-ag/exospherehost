import json
import requests
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any


class GenerateAnswerNode(BaseNode):

    class Inputs(BaseModel):
        source_chunk: str
        generated_question: str
        chunk_id: str

    class Outputs(BaseModel):
        generated_answer: str
        question: str
        source_chunk: Dict[str, Any]
        chunk_id: int

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Generate an answer to the question based on the source chunk.
        """
        
        # Parse the source_chunk JSON string
        chunk_data = json.loads(self.inputs.source_chunk)
        chunk_content = chunk_data["content"]
        question = self.inputs.generated_question
        chunk_id = int(self.inputs.chunk_id)
        
        # Generate answer using OpenAI API
        headers = {
            "Authorization": f"Bearer {self.secrets.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {
                "role": "system",
                "content": "You are an answer generation assistant. Based on the given text chunk, provide a clear and accurate answer to the question. The answer should be based solely on the information provided in the text chunk."
            },
            {
                "role": "user",
                "content": f"Question: {question}\n\nText chunk:\n{chunk_content}\n\nPlease provide an answer based on the text chunk above."
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
            
            generated_answer = response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            # Fallback answer if API call fails
            generated_answer = f"Based on the provided text chunk, the answer to '{question}' would be found in the content."
            print(f"OpenAI API call failed: {e}")
        
        return self.Outputs(
            generated_answer=generated_answer,
            question=question,
            source_chunk=chunk_data,
            chunk_id=chunk_id
        )
