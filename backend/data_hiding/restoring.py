import math
import cv2
import numpy as np
from data_hiding.rule_creating import check_pixels, ExtractRule

def extract_bits(
    x11: int, x12: int, x21: int, x22: int,
    extract_rule_min: dict, extract_rule_max: dict
):
    xs11 = x11
    xs12 = x12
    xs21 = x21
    xs22 = x22
    sort = False

    if x12 < x11:
        xs11 = x12
        xs12 = x11
        xs21 = x22
        xs22 = x21
        sort = True

    xs1 = math.ceil((xs11 + xs21) / 2)
    xs2 = math.floor((xs12 + xs22) / 2)
    x1 = xs1
    x2 = xs2

    if sort:
        x1 = xs2
        x2 = xs1

    b1b2 = extract_rule_min[xs21 - xs11]
    b2b3 = extract_rule_max[xs22 - xs12]
    bits = b1b2 + b2b3

    return x1, x2, bits

def restore_data(image1: np.ndarray, image2: np.ndarray, extract_rule: ExtractRule):
    img1 = np.int32(image1)
    img2 = np.int32(image2)

    m, n = img1.shape
    img = img1.copy()
    d = ""
    count = 0

    for i in range(m):
        for j in range(0, n-1, 2):
            if count >= extract_rule.data_length:
                break

            if (
                img1[i, j] == img2[i, j]
                and img1[i, j+1] == img2[i, j+1]
                and not check_pixels(img1[i, j], img1[i, j+1])
            ):
                continue

            x1, x2, bits = extract_bits(
                img1[i, j],
                img1[i, j+1],
                img2[i, j],
                img2[i, j+1],
                extract_rule.extract_rule_min,
                extract_rule.extract_rule_max,
            )

            img[i, j] = x1
            img[i, j+1] = x2
            d += bits
            count += 4

    m1 = int(d[0:10], 2)
    n1 = int(d[10:20], 2)
    data = np.full((m1, n1), 0)
    index = 20
    for i in range(m1):
        for j in range(n1):
            data[i, j] = int(d[index])
            if data[i, j] == 1:
                data[i, j] = 255
            index += 1

    return np.uint8(img), np.uint8(data)