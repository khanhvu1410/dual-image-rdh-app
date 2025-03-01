import os
import cv2
import numpy as np
import uvicorn
import json
from fastapi import FastAPI, UploadFile, HTTPException, status
from app.core.config import BASE_DIR, KEY_DIR
from data_hiding.rule_creating import ExtractRule
from app.schema import ExtractRuleResponse
from data_hiding.embedding import embed_data
from data_hiding.extracting import extract_data

app = FastAPI()

async def read_image(file: UploadFile):
    contents = await file.read()
    np_arr = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
    return image

@app.post("/image-embedding/", response_model=ExtractRuleResponse)
async def embed_image(image_file: UploadFile, data_file: UploadFile):
    image = await read_image(image_file)
    data = await read_image(data_file)

    image1, image2, extract_rule = embed_data(image, data)

    file_name = image_file.filename.split(".")
    image1_path = os.path.join(BASE_DIR, f"img/output_images/{file_name[0]}_embedded_1.{file_name[1]}")
    image2_path = os.path.join(BASE_DIR, f"img/output_images/{file_name[0]}_embedded_2.{file_name[1]}")

    cv2.imwrite(image1_path, image1)
    cv2.imwrite(image2_path, image2)

    extract_rule_dict = {
        "data_length": extract_rule.data_length,
        "extract_rule_min": extract_rule.extract_rule_min,
        "extract_rule_max": extract_rule.extract_rule_max,
    }

    extract_rule_json = json.dumps(extract_rule_dict, indent=4)
    extract_rule_path = os.path.join(KEY_DIR, f"{file_name[0]}_extract_rule.json")
    with open(extract_rule_path, "w") as f:
        f.write(extract_rule_json)

    return extract_rule

@app.post("/image-extracting/")
async def extract_image(
    image_file_1: UploadFile,
    image_file_2: UploadFile,
    extract_rule_file: UploadFile
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

    extract_rule_dict = json.load(extract_rule_file.file)

    extract_rule = ExtractRule(**extract_rule_dict)

    min_keys = extract_rule.extract_rule_min.keys()
    min_keys = list(map(lambda key: int(key), min_keys))
    min_values = extract_rule.extract_rule_min.values()
    extract_rule.extract_rule_min = dict(zip(min_keys, min_values))
    print(extract_rule.extract_rule_min)

    max_keys = extract_rule.extract_rule_max.keys()
    max_keys = list(map(lambda key: int(key), max_keys))
    max_values = extract_rule.extract_rule_max.values()
    extract_rule.extract_rule_max = dict(zip(max_keys, max_values))
    print(extract_rule.extract_rule_max)

    restored_image, restored_data = extract_data(image1, image2, extract_rule)
    restored_image_path = os.path.join(BASE_DIR, f"img/output_images/restored_image.{file_name_1[1]}")
    restored_data_path = os.path.join(BASE_DIR, f"img/output_data/extracted_data.{file_name_1[1]}")

    cv2.imwrite(restored_image_path, restored_image)
    cv2.imwrite(restored_data_path, restored_data)

    return {
        "message": "Image extracted successfully",
    }

@app.get("/")
async def root():
    return {"message": "reversible-data-hiding-app"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)