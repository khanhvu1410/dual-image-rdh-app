import json
from pathlib import Path
from typing import Any
import cv2
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.rdh.extractor import Extractor
from app.utils.image_utils import read_image
from app.utils.zip_utils import zip_file

class ExtractingService:
    def __init__(self, output_extract_dir: Path = settings.OUTPUT_EXTRACT_DIR):
        self.output_extract_dir = output_extract_dir

    async def extract_data(
        self,
        image_file_1: UploadFile,
        image_file_2: UploadFile,
        key_file: UploadFile
    ):
        # Validate that all images have the same file extension
        extensions = {Path(f.filename).suffix for f in (image_file_1, image_file_2)}
        if len(extensions) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All images must have the same file extension"
            )

        image1 = await read_image(image_file_1)
        image2 = await read_image(image_file_2)

        extractor = self.create_extractor(image1, image2, key_file)

        restored_image, restored_data = extractor.extract_data()
        file_paths = self.save_result(restored_image, restored_data, image_file_1.filename)

        return zip_file(file_paths, "restored_images.zip")

    def create_extractor(self, image1: Any, image2: Any, key_file: UploadFile):
        # Parse the key file
        key_dict = json.load(key_file.file)

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

    def save_result(self, restored_image: Any, restored_data: Any, original_filename: str):
        ext = Path(original_filename).suffix[1:]

        restored_image_path = self.output_extract_dir / f"restored_host_image.{ext}"
        restored_data_path = self.output_extract_dir / f"extracted_hidden_image.{ext}"

        cv2.imwrite(str(restored_image_path), restored_image)
        cv2.imwrite(str(restored_data_path), restored_data)

        return [restored_image_path, restored_data_path]

def get_extracting_service():
    return ExtractingService()