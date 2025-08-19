import json
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any, List


class PreprocessTablesNode(BaseNode):

    class Inputs(BaseModel):
        extracted_content: Dict[str, Any]

    class Outputs(BaseModel):
        markdown_tables: List[str]
        original_tables: List[Dict[str, Any]]

    class Secrets(BaseModel):
        pass  # No secrets required for table processing

    async def execute(self) -> Outputs:
        """
        Preprocess and clean table data, convert to markdown format.
        """
        
        # Extract tables from the extracted content
        tables = self.inputs.extracted_content.get("tables", [])
        
        # Convert tables to markdown format
        markdown_tables = []
        for table in tables:
            # This is a simplified conversion
            # In a real implementation, you would parse the table structure
            # and convert it to proper markdown format
            
            table_data = table.get("table_data", "")
            
            # Simple markdown table conversion
            if "|" in table_data:
                # Already in markdown format
                markdown_table = table_data
            else:
                # Convert to basic markdown table
                markdown_table = "| Column1 | Column2 | Column3 |\n|---------|---------|---------|\n| Data1   | Data2   | Data3   |"
            
            markdown_tables.append(markdown_table)
        
        return self.Outputs(
            markdown_tables=markdown_tables,
            original_tables=tables
        )
