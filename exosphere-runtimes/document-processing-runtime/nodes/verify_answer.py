import json
import requests
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any


class VerifyAnswerNode(BaseNode):

    class Inputs(BaseModel):
        generated_answer: str
        question: str
        source_chunk: str

    class Outputs(BaseModel):
        verification_results: str
        is_correct: bool
        is_relevant: bool
        is_biased: bool
        is_hallucination: bool
        answer: str
        question: str

    class Secrets(BaseModel):
        openai_api_key: str

    async def execute(self) -> Outputs:
        """
        Verify the quality and accuracy of the generated answer using AI.
        """
        
        # Use OpenAI API to verify answers
        headers = {
            "Authorization": f"Bearer {self.secrets.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {
                "role": "system",
                "content": "You are an answer verification expert. Evaluate the given answer based on correctness, relevance, bias, and potential hallucination. Provide a structured assessment."
            },
            {
                "role": "user",
                "content": f"Question: {self.inputs.question}\n\nAnswer: {self.inputs.generated_answer}\n\nSource: {self.inputs.source_chunk}\n\nEvaluate this answer for:\n1. Correctness\n2. Relevance\n3. Bias\n4. Hallucination\n\nProvide your assessment:"
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
            
            verification = response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            # Fallback verification if API call fails
            verification = "Verification could not be completed due to API error."
            print(f"OpenAI API call failed: {e}")
        
        # Parse verification results (simplified)
        verification_lower = verification.lower()
        is_correct = "correct" in verification_lower and "incorrect" not in verification_lower
        is_relevant = "relevant" in verification_lower and "irrelevant" not in verification_lower
        is_biased = "bias" in verification_lower and "unbiased" not in verification_lower
        is_hallucination = "hallucination" in verification_lower or "fabricated" in verification_lower
        
        return self.Outputs(
            verification_results=verification,
            is_correct=is_correct,
            is_relevant=is_relevant,
            is_biased=is_biased,
            is_hallucination=is_hallucination,
            answer=self.inputs.generated_answer,
            question=self.inputs.question
        )
