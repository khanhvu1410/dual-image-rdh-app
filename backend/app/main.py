import io
import os
import cv2
import numpy as np
import uvicorn
import json
from fastapi import FastAPI, UploadFile, HTTPException, status
from starlette.middleware.cors import CORSMiddleware
from app.core.config import OUTPUT_EMBED_DIR, OUTPUT_EXTRACT_DIR
import zipfile
from fastapi.responses import StreamingResponse
from app.rdh.embedder import Embedder
from app.rdh.extractor import Extractor

app = FastAPI()

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:800",
    "https://rdh-dual-images.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

async def read_image(file: UploadFile):
    contents = await file.read()
    np_arr = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
    return image

def zip_file(file_paths, zip_filename):
    zip_subdir = f"{zip_filename.split(".")[0]}"
    zip_io = io.BytesIO()

    with zipfile.ZipFile(
        zip_io,
        mode="w",
        compression=zipfile.ZIP_DEFLATED,
    ) as temp_zip:
        for file_path in file_paths:
            # Calculate path for file in archive
            file_dir, file_name = os.path.split(file_path)
            zip_path = os.path.join(zip_subdir, file_name)
            # Add file, at correct path
            temp_zip.write(file_path, zip_path)
            # Remove file after adding to archive
            os.remove(file_path)

    return StreamingResponse(
        iter([zip_io.getvalue()]),
        media_type="application/x-archive-compressed",
        headers={
            "Content-Disposition": f"attachment; filename={zip_filename}",
        }
    )

@app.post("/image-embedding/")
async def embed_image(image_files: list[UploadFile], data_file: UploadFile):
    data = await read_image(data_file)
    embedder = Embedder(data)

    file_paths = []

    extract_rule_dict = {
        "data_length": embedder.data_length,
        "extract_rule_min": embedder.extract_rule_min,
        "extract_rule_max": embedder.extract_rule_max,
    }

    extract_rule_json = json.dumps(extract_rule_dict, indent=4)
    extract_rule_path = os.path.join(OUTPUT_EMBED_DIR, f"{data_file.filename.split(".")[0]}_key.json")
    with open(extract_rule_path, "w") as f:
        f.write(extract_rule_json)

    file_paths.append(extract_rule_path)

    for image_file in image_files:
        image = await read_image(image_file)

        image1, image2 = embedder.embed_data(image)

        image_name = image_file.filename.split(".")
        image1_path = os.path.join(OUTPUT_EMBED_DIR, f"{image_name[0]}_embedded_1.{image_name[1]}")
        image2_path = os.path.join(OUTPUT_EMBED_DIR, f"{image_name[0]}_embedded_2.{image_name[1]}")

        cv2.imwrite(image1_path, image1)
        cv2.imwrite(image2_path, image2)

        file_paths.append(image1_path)
        file_paths.append(image2_path)

    return zip_file(file_paths, f"{data_file.filename.split(".")[0]}_embed.zip")

@app.post("/image-extracting/")
async def extract_image(
    image_file_1: UploadFile,
    image_file_2: UploadFile,
    key_file: UploadFile
):
    file_name_1 = image_file_1.filename.split(".")
    file_name_2 = image_file_2.filename.split(".")

    if file_name_1[1] != file_name_2[1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Images must have the same file's extension"
        )

    image1 = await read_image(image_file_1)
    image2 = await read_image(image_file_2)

    key_dict = json.load(key_file.file)

    data_length = key_dict["data_length"]

    min_keys = key_dict["extract_rule_min"].keys()
    min_keys = list(map(lambda key: int(key), min_keys))
    min_values = key_dict["extract_rule_min"].values()
    extract_rule_min = dict(zip(min_keys, min_values))

    max_keys = key_dict["extract_rule_max"].keys()
    max_keys = list(map(lambda key: int(key), max_keys))
    max_values = key_dict["extract_rule_max"].values()
    extract_rule_max = dict(zip(max_keys, max_values))

    extractor = Extractor(image1, image2, data_length, extract_rule_min, extract_rule_max)
    restored_image, restored_data = extractor.extract_data()
    restored_image_path = os.path.join(OUTPUT_EXTRACT_DIR, f"restored_host_image.{file_name_1[1]}")
    restored_data_path = os.path.join(OUTPUT_EXTRACT_DIR, f"extracted_hidden_image.{file_name_1[1]}")

    cv2.imwrite(restored_image_path, restored_image)
    cv2.imwrite(restored_data_path, restored_data)

    file_paths = [restored_image_path, restored_data_path]

    return zip_file(file_paths, "restored_images.zip")

@app.get("/")
async def root():
    return {"message": "reversible-data-hiding-app"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)