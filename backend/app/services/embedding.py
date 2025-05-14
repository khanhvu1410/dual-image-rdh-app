import json
from pathlib import Path
import cv2
from fastapi import UploadFile
from app.core.config import settings
from app.rdh.embedder import Embedder
from app.utils.image_utils import read_image
from app.utils.zip_utils import zip_file

class EmbeddingService:
    def __init__(self, output_embed_dir: Path = settings.OUTPUT_EMBED_DIR):
        self.output_embed_dir = output_embed_dir

    async def embed_images(self, image_files: list[UploadFile], data_file: UploadFile):
        data = await read_image(data_file)
        embedder = Embedder(data)

        file_paths = []
        filename_stem = Path(data_file.filename).stem

        # Create and save extract rule file
        extract_rule_path = self.create_extract_rule_file(embedder, filename_stem)
        file_paths.append(extract_rule_path)

        for image_file in image_files:
            image1_path, image2_path = await self.process_image(embedder, image_file)
            file_paths.extend([image1_path, image2_path])

        return zip_file(file_paths, f"{filename_stem}_embed.zip")

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
        image = await read_image(image_file)
        image1, image2 = embedder.embed_data(image)

        image_stem = Path(image_file.filename).stem
        ext = Path(image_file.filename).suffix[1:]

        image1_path = self.output_embed_dir / f"{image_stem}_embedded_1.{ext}"
        image2_path = self.output_embed_dir / f"{image_stem}_embedded_2.{ext}"

        cv2.imwrite(str(image1_path), image1)
        cv2.imwrite(str(image2_path), image2)

        return image1_path, image2_path

def get_embedding_service():
    return EmbeddingService()