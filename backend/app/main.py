from typing import List, Annotated
import uvicorn
from fastapi import FastAPI, UploadFile, Depends, Form
from starlette.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.schemas.file import FileResponse
from app.services.embedding import EmbeddingService, get_embedding_service
from app.services.extracting import ExtractingService, get_extracting_service

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.post("/embedding/")
async def embed_data(
    image_files: list[UploadFile],
    data_file: UploadFile,
    encryption_key: Annotated[str, Form()],
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    return await embedding_service.embed_data(image_files, data_file, encryption_key)

@app.post("/extracting/")
async def extract_data(
    image_file_1: UploadFile,
    image_file_2: UploadFile,
    key_file: UploadFile,
    encryption_key: Annotated[str, Form()],
    extracting_service: ExtractingService = Depends(get_extracting_service),
):
    return await extracting_service.extract_data(image_file_1, image_file_2, key_file, encryption_key)

@app.post("/embedding/preview", response_model=List[FileResponse])
async def embed_preview(
    image_files: list[UploadFile],
    data_file: UploadFile,
    encryption_key: Annotated[str, Form()],
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    return await embedding_service.embed_preview(image_files, data_file, encryption_key)

@app.post("/extracting/preview", response_model=List[FileResponse])
async def extract_data(
    image_file_1: UploadFile,
    image_file_2: UploadFile,
    key_file: UploadFile,
    encryption_key: Annotated[str, Form()],
    extracting_service: ExtractingService = Depends(get_extracting_service),
):
    return await extracting_service.extract_preview(image_file_1, image_file_2, key_file, encryption_key)

@app.get("/")
async def root():
    return {"message": "reversible-data-hiding-app"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)