import numpy as np
from data_hiding.rule_creating import check_pixels, transform_data, create_rule

def embed_bits(x1: int, x2: int, bits: str, embed_rule: dict):
    sort = False
    xs1 = x1
    xs2 = x2

    if x2 < x1:
        sort = True
        xs1 = x2
        xs2 = x1

    b1b2 = bits[0:2]
    b3b4 = bits[2:4]

    min_values = embed_rule[b1b2]
    max_values = embed_rule[b3b4]
    xs11 = xs1 + min_values[0]
    xs21 = xs1 + min_values[1]
    xs12 = xs2 + max_values[2]
    xs22 = xs2 + max_values[3]

    x11 = xs11
    x12 = xs12
    x21 = xs21
    x22 = xs22

    if sort:
        x11 = xs12
        x12 = xs11
        x21 = xs22
        x22 = xs21

    return x11, x12, x21, x22

def embed_data(image: np.ndarray, data: np.ndarray):
    img = np.int32(image)
    m, n = img.shape

    d = transform_data(data)
    data_length = len(d)

    embed_rule, extract_rule = create_rule(d)
    # print("Embed rule: ")
    # print(embed_rule)
    # print("Extract rule min: ")
    # print(extract_rule.extract_rule_min)
    # print("Extract rule max: ")
    # print(extract_rule.extract_rule_max)

    img1 = img.copy()
    img2 = img.copy()
    k = 0

    for i in range(m):
        for j in range(0, n-1, 2):
            if k >= data_length:
                break
            if check_pixels(img[i, j], img[i, j+1]):
                x11, x12, x21, x22 = embed_bits(
                    img[i, j],
                    img[i, j+1],
                    d[k:k+4],
                    embed_rule
                )
                img1[i, j] = x11
                img1[i, j+1]= x12
                img2[i, j] = x21
                img2[i, j+1] = x22
                k += 4

    return np.uint8(img1), np.uint8(img2), extract_rule