import json
import httpx 
from exospherehost import BaseNode
from pydantic import BaseModel


class VerifyAnswerNode(BaseNode):

    class Inputs(BaseModel):
        generated_answer: str
        question: str
        source_chunk: str
        chunk_id: str

    class Outputs(BaseModel):
        verification_results: str
        chunk_id: str
        key: str

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Verify the accuracy of the generated answer against the source chunk.
        """
        
        # Parse the source_chunk JSON string
        chunk_data = json.loads(self.inputs.source_chunk)
        chunk_content = chunk_data["content"]
        question = self.inputs.question
        answer = self.inputs.generated_answer
        chunk_id = int(self.inputs.chunk_id)
        
        # Verify answer using OpenAI API
        headers = {
            "Authorization": f"Bearer {self.secrets.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {
                "role": "system",
                "content": "You are an answer verification assistant. Evaluate whether the given answer accurately addresses the question based on the source text. Provide a verification score (0-100) and detailed feedback."
            },
            {
                "role": "user",
                "content": f"Question: {question}\n\nAnswer: {answer}\n\nSource text:\n{chunk_content}\n\nPlease verify the accuracy of the answer and provide a score and feedback."
            }
        ]
        
        payload = {
            "model": "gpt-4",
            "messages": messages,
            "temperature": 0.3
        }
        
        try:
           async with httpx.AsyncClient() as client:  
                response = await client.post(  
                    "https://api.openai.com/v1/chat/completions",  
                    headers=headers,  
                    json=payload  
                ) 
                response.raise_for_status()
            
                verification_feedback = response.json()["choices"][0]["message"]["content"]
            
                # Extract score from feedback (simplified)
                score = 85  # Default score, in production you'd parse this from the feedback
            
        except Exception as e:
            verification_feedback = "Verification failed due to API error"
            score = 50
            print(f"OpenAI API call failed: {e}")
        
        verification_results = {
            "question": question,
            "answer": answer,
            "source_chunk": chunk_content,
            "verification_score": score,
            "verification_feedback": verification_feedback,
            "chunk_id": chunk_id,
            "key": chunk_data["key"]
        }
        
        return self.Outputs(
            verification_results=json.dumps(verification_results),
            chunk_id=chunk_id,
            key=chunk_data["key"]
        )
