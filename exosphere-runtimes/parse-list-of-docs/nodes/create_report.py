import json
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any


class CreateReportNode(BaseNode):

    class Inputs(BaseModel):
        verification_results: str
        chunk_id: str
        key: str

    class Outputs(BaseModel):
        final_report: str
        key: str

    class Secrets(BaseModel):
        pass

    async def execute(self) -> Outputs:
        """
        Create a final report from the verification results.
        """
        
        # Parse the verification_results JSON string
        results = json.loads(self.inputs.verification_results)
        chunk_id = int(self.inputs.chunk_id)
        
        # Create a comprehensive report
        report = {
            "key": self.inputs.key,
            "chunk_id": chunk_id,
            "question": results["question"],
            "answer": results["answer"],
            "verification_score": results["verification_score"],
            "verification_feedback": results["verification_feedback"],
            "source_chunk_preview": results["source_chunk"][:200] + "..." if len(results["source_chunk"]) > 200 else results["source_chunk"],
            "timestamp": "2024-01-20T10:30:00Z",  # In production, use actual timestamp
            "status": "completed",
            "summary": f"Generated question and answer for chunk {chunk_id} with verification score {results['verification_score']}/100"
        }
        
        return self.Outputs(
            final_report=json.dumps(report),
            key=self.inputs.key
        )
