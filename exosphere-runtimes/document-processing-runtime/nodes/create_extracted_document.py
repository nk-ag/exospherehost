import json
from exospherehost import BaseNode
from pydantic import BaseModel
from typing import Dict, Any, List


class CreateExtractedDocumentNode(BaseNode):

    class Inputs(BaseModel):
        cleaned_markdown: str
        markdown_tables: List[str]
        unique_image_descriptions: List[Dict[str, Any]]

    class Outputs(BaseModel):
        extracted_document: str
        document_sections: List[str]

    class Secrets(BaseModel):
        pass  # No secrets required for document creation

    async def execute(self) -> Outputs:
        """
        Combine all processed content into a unified extracted document.
        """
        
        document_sections = []
        
        # Add text content
        if self.inputs.cleaned_markdown:
            document_sections.append(f"## Text Content\n{self.inputs.cleaned_markdown}")
        
        # Add tables
        if self.inputs.markdown_tables:
            tables_section = "## Tables\n"
            for table in self.inputs.markdown_tables:
                tables_section += f"{table}\n\n"
            document_sections.append(tables_section)
        
        # Add images
        if self.inputs.unique_image_descriptions:
            image_section = "## Images\n"
            for img_desc in self.inputs.unique_image_descriptions:
                description = img_desc.get("description", "")
                image_section += f"**Image**: {description}\n\n"
            document_sections.append(image_section)
        
        # Combine all sections
        extracted_document = "\n\n".join(document_sections)
        
        return self.Outputs(
            extracted_document=extracted_document,
            document_sections=document_sections
        )
