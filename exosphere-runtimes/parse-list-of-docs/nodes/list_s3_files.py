from exospherehost import BaseNode
from pydantic import BaseModel
from typing import List


class ListS3FilesNode(BaseNode):

    class Inputs(BaseModel):
        bucket_name: str
        prefix: str = ""
        files_only: str = "false"
        recursive: str = "false"

    class Outputs(BaseModel):
        key: str

    class Secrets(BaseModel):
        aws_access_key_id: str
        aws_secret_access_key: str
        aws_region: str

    async def execute(self) -> List[Outputs]:
        """
        List files from S3 bucket with given prefix.
        
        This is a simplified implementation. In production, you would use
        boto3 to actually connect to AWS S3.
        """       
        
        # For now, we'll simulate the S3 file listing
        # In a real implementation, you would:
        # 1. Use boto3 to connect to S3
        # 2. List objects with the given prefix
        # 3. Return the list of files
        
        simulated_keys = [
            f"{self.inputs.prefix}document1.pdf",
            f"{self.inputs.prefix}document2.pdf",
            f"{self.inputs.prefix}document3.pdf"
        ]
        
        return [
            self.Outputs(key=key)
            for key in simulated_keys
        ]
