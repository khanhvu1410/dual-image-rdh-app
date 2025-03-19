import math
import numpy as np

class Extractor:
    def __init__(self, image1, image2, data_length, extract_rule_min, extract_rule_max):
        self.image1 = image1
        self.image2 = image2
        self.data_length = data_length
        self.extract_rule_min = extract_rule_min
        self.extract_rule_max = extract_rule_max

    def extract_bits(self, x11: int, x12: int, x21: int, x22: int):
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

        b1b2 = self.extract_rule_min[xs21 - xs11]
        b2b3 = self.extract_rule_max[xs22 - xs12]
        bits = b1b2 + b2b3

        return x1, x2, bits

    def extract_data(self):
        img1 = np.int32(self.image1)
        img2 = np.int32(self.image2)

        m, n = img1.shape
        img = img1.copy()
        d = ""
        count = 0

        for i in range(m):
            for j in range(0, n - 1, 2):
                if count >= self.data_length:
                    break

                if (
                    img1[i, j] == img2[i, j]
                    and img1[i, j + 1] == img2[i, j + 1]
                    and not (2 <= img1[i, j] <= 253 and 2 <= img1[i, j + 1] <= 253)
                ):
                    continue

                x1, x2, bits = self.extract_bits(
                    img1[i, j],
                    img1[i, j + 1],
                    img2[i, j],
                    img2[i, j + 1],
                )

                img[i, j] = x1
                img[i, j + 1] = x2
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