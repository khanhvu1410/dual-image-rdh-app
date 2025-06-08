from pydantic import BaseModel

class FileResponse(BaseModel):
   filename: str
   content: str
   type: str
   size: int