import cv2
import numpy as np
from fastapi import UploadFile

async def read_image(file: UploadFile):
    contents = await file.read()
    np_arr = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
    return image