import json
import httpx
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any


class GenerateQuestionNode(BaseNode):

    class Inputs(BaseModel):
        chunk: str

    class Outputs(BaseModel):
        source_chunk: Dict[str, Any]
        generated_question: str
        chunk_id: int

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Generate a question based on the content of a single chunk.
        """
        
        # Parse the chunk JSON string
        chunk_data = json.loads(self.inputs.chunk)
        chunk_content = chunk_data["content"]
        chunk_id = chunk_data["chunk_id"]
        
        # Generate question using OpenAI API
        headers = {
            "Authorization": f"Bearer {self.secrets.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {
                "role": "system",
                "content": "You are a question generation assistant. Based on the given text chunk, generate a relevant question that can be answered from the content. The question should be clear, specific, and test understanding of the key concepts in the text."
            },
            {
                "role": "user",
                "content": f"Generate a question based on this text chunk:\n\n{chunk_content}"
            }
        ]
        
        payload = {
            "model": "gpt-4",
            "messages": messages,
            "temperature": 0.7
        }
        
        try:
            async with httpx.AsyncClient() as client:  
                response = await client.post(  
                    "https://api.openai.com/v1/chat/completions",  
                    headers=headers,  
                    json=payload  
                )  
                response.raise_for_status()  
                generated_question = response.json()["choices"][0]["message"]["content"]  
                
        except Exception as e:
            # Fallback question if API call fails
            generated_question = "What are the main points discussed in this text chunk?"
            print(f"OpenAI API call failed: {e}")
        
        return self.Outputs(
            source_chunk=chunk_data,
            generated_question=generated_question,
            chunk_id=chunk_id
        )
