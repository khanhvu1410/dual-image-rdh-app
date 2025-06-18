import base64
import json
from pathlib import Path
from typing import Any
import cv2
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.rdh.extractor import Extractor
from app.schemas.file import FileResponse
from app.utils.crypto_utils import AESCipher
from app.utils.image_utils import read_image
from app.utils.zip_utils import zip_file

class ExtractingService:
    def __init__(
        self,
        output_extract_dir: Path = settings.OUTPUT_EXTRACT_DIR,
        allowed_image_mime_types = settings.ALLOWED_IMAGE_MIME_TYPES
    ):
        self.output_extract_dir = output_extract_dir
        self.allowed_image_mime_types = allowed_image_mime_types

    async def extract_data(
        self,
        image_file_1: UploadFile,
        image_file_2: UploadFile,
        key_file: UploadFile,
        encryption_key: str,
    ):
        restored_image, restored_data = await self.process_files(image_file_1, image_file_2, key_file, encryption_key)
        file_paths = self.save_result(restored_image, restored_data, image_file_1.filename)
        return zip_file(file_paths, "restored_images.zip")

    async def extract_preview(
        self,
        image_file_1: UploadFile,
        image_file_2: UploadFile,
        key_file: UploadFile,
        encryption_key: str
    ):
        restored_image, restored_data = await self.process_files(image_file_1, image_file_2, key_file, encryption_key)
        ext = Path(image_file_1.filename).suffix[1:]
        results = []

        # Convert images to base64
        _, restored_image_encoded = cv2.imencode(f'.{ext}', restored_image)
        restored_image_base64 = base64.b64encode(restored_image_encoded).decode('utf-8')

        _, restored_data_encoded = cv2.imencode(f'.{ext}', restored_data)
        restored_data_base64 = base64.b64encode(restored_data_encoded).decode('utf-8')

        # Calculate image sizes
        restored_image_size = len(restored_image_encoded.tobytes())
        restored_data_size = len(restored_data_encoded.tobytes())

        results.extend([
            FileResponse(
                filename=f"restored_host_image.{ext}",
                content=restored_image_base64,
                type="image",
                size=restored_image_size
            ),
            FileResponse(
                filename=f"extracted_hidden_image.{ext}",
                content=restored_data_base64,
                type="image",
                size=restored_data_size
            )
        ])

        return results

    async def process_files(
        self,
        image_file_1: UploadFile,
        image_file_2: UploadFile,
        key_file: UploadFile,
        encryption_key: str
    ):
        # Validate that all images have the same file extension
        extensions = {Path(f.filename).suffix for f in (image_file_1, image_file_2)}
        if len(extensions) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All images must have the same file extension."
            )

        # Validate that all images have the valid type
        if image_file_1.content_type not in self.allowed_image_mime_types or image_file_2.content_type not in self.allowed_image_mime_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not all images are valid. Allowed types: {self.allowed_image_mime_types}."
            )

        image1 = await read_image(image_file_1)
        image2 = await read_image(image_file_2)

        # Validate that all images are grayscale
        if len(image1.shape) != 2 or len(image2.shape) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not all images are grayscale. Please convert all images to grayscale before processing."
            )

        if Path(key_file.filename).suffix.lower() != ".json":
            raise HTTPException(400, detail="Key file must have a .json extension.")

        extractor = self.create_extractor(image1, image2, key_file, encryption_key)

        try:
            restored_image, restored_data = extractor.extract_data()
        except:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An unexpected error occurred while extracting data."
            )

        return restored_image, restored_data

    def create_extractor(self, image1: Any, image2: Any, key_file: UploadFile, encryption_key: str):
        # Read the key file content
        key_content = key_file.file.read().decode('utf-8')

        # Decrypt the content
        cipher = AESCipher(encryption_key)
        key_content = cipher.decrypt(key_content)

        try:
            # Parse the key file
            key_dict = json.loads(key_content)

            # Convert keys from strings to integer
            min_dict = {int(k):v for k, v in key_dict["extract_rule"]["min"].items()}
            max_dict = {int(k):v for k, v in key_dict["extract_rule"]["max"].items()}

            return Extractor(
                image1=image1,
                image2=image2,
                data_length=key_dict["data_length"],
                extract_rule={
                    "min": min_dict,
                    "max": max_dict,
                }
            )
        except:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An unexpected error occurred while loading the key file."
            )

    def save_result(self, restored_image: Any, restored_data: Any, original_filename: str):
        ext = Path(original_filename).suffix[1:]

        restored_image_path = self.output_extract_dir / f"restored_host_image.{ext}"
        restored_data_path = self.output_extract_dir / f"extracted_hidden_image.{ext}"

        cv2.imwrite(str(restored_image_path), restored_image)
        cv2.imwrite(str(restored_data_path), restored_data)

        return [restored_image_path, restored_data_path]

def get_extracting_service():
    return ExtractingService()