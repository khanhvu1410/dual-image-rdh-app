import base64
import json
from pathlib import Path
import cv2
import numpy as np
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.rdh.embedder import Embedder
from app.schemas.file import FileResponse
from app.utils.image_utils import read_image
from app.utils.zip_utils import zip_file

class EmbeddingService:
    def __init__(
        self,
        output_embed_dir: Path = settings.OUTPUT_EMBED_DIR,
        allowed_image_mime_types = settings.ALLOWED_IMAGE_MIME_TYPES
    ):
        self.output_embed_dir = output_embed_dir
        self.allowed_image_mime_types = allowed_image_mime_types

    async def embed_data(self, image_files: list[UploadFile], data_file: UploadFile):
        data = await self.process_data_file(data_file)
        embedder = Embedder(data)
        file_paths = []
        filename_stem = Path(data_file.filename).stem

        # Create and save extract rule file
        extract_rule_path = self.create_extract_rule_file(embedder, filename_stem)
        file_paths.append(extract_rule_path)

        for image_file in image_files:
            image1, image2 = await self.process_image(embedder, image_file)
            image_stem = Path(image_file.filename).stem
            ext = Path(image_file.filename).suffix[1:]

            image1_path = self.output_embed_dir / f"{image_stem}_stego_1.{ext}"
            image2_path = self.output_embed_dir / f"{image_stem}_stego_2.{ext}"

            cv2.imwrite(str(image1_path), image1)
            cv2.imwrite(str(image2_path), image2)
            file_paths.extend([image1_path, image2_path])

        return zip_file(file_paths, f"{filename_stem}_embed.zip")

    async def embed_preview(self, image_files: list[UploadFile], data_file: UploadFile):
        data = await self.process_data_file(data_file)
        embedder = Embedder(data)
        results = []

        for image_file in image_files:
            image1, image2 = await self.process_image(embedder, image_file)
            image_stem = Path(image_file.filename).stem
            ext = Path(image_file.filename).suffix[1:]

            # Convert images to base64
            _, image1_encoded = cv2.imencode(f'.{ext}', image1)
            image1_base64 = base64.b64encode(image1_encoded).decode('utf-8')

            _, image2_encoded = cv2.imencode(f'.{ext}', image2)
            image2_base64 = base64.b64encode(image2_encoded).decode('utf-8')

            # Calculate image sizes
            image1_size = len(image1_encoded.tobytes())
            image2_size = len(image2_encoded.tobytes())

            results.extend([
                FileResponse(
                    filename=f"{image_stem}_stego_1.{ext}",
                    content=image1_base64,
                    type="image",
                    size=image1_size,
                ),
                FileResponse(
                    filename=f"{image_stem}_stego_2.{ext}",
                    content=image2_base64,
                    type="image",
                    size=image2_size,
                ),
            ])

        return results

    async def process_data_file(self, data_file: UploadFile):
        if data_file.content_type not in self.allowed_image_mime_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{data_file.filename}' is not a valid image. Allowed types: {self.allowed_image_mime_types}."
            )
        data = await read_image(data_file)
        # Validate that data file is binary image
        unique_values = set(np.unique(data))
        if not unique_values.issubset({0, 255}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Data file {data_file.filename} is not a binary image (should contain only black and white pixels with values 0 and 255)."
            )
        return data

    def create_extract_rule_file(self, embedder: Embedder, filename_stem: str):
        # Create and save the extract rule JSON file
        extract_rule_dict = {
            "data_length": embedder.data_length,
            "extract_rule": embedder.extract_rule
        }

        extract_rule_json = json.dumps(extract_rule_dict, indent=4)
        extract_rule_path = self.output_embed_dir / f"{filename_stem}_key.json"

        with open(extract_rule_path, "w") as f:
            f.write(extract_rule_json)

        return extract_rule_path

    async def process_image(self, embedder: Embedder, image_file: UploadFile):
        # Validate that all images have the valid type
        if image_file.content_type not in self.allowed_image_mime_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{image_file.filename}' is not a valid image. Allowed types: {self.allowed_image_mime_types}."
            )

        image = await read_image(image_file)

        # Validate that all images are grayscale
        if len(image.shape) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image '{image_file.filename}' is not grayscale. Please convert the image to grayscale before processing."
            )

        try:
            image1, image2 = embedder.embed_data(image)
            return image1, image2
        except:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An unexpected error occurred while embedding data."
            )

def get_embedding_service():
    return EmbeddingService()