import numpy as np

class Embedder:
    def __init__(self, data):
        self.data = data
        self.transform_data()
        (
            self.data_length,
            self.embed_rule,
            self.extract_rule
        ) = self.create_rule()

    def print_rules(self):
        print("Embedding rule: ")
        print(self.embed_rule)
        print("Extracting rule: ")
        print(self.extract_rule)

    def transform_data(self):
        d = self.data.copy()
        m, n = d.shape

        d = np.array(d / d.max(), dtype=np.uint8)
        td = d.reshape(-1)
        td = "".join(str(x) for x in td)

        m_bin = bin(m)[2:].zfill(10)
        n_bin = bin(n)[2:].zfill(10)

        self.data = m_bin + n_bin + td

    def create_rule(self):
        count_dict = {"00": 0, "01": 0, "10": 0, "11": 0}

        data_length = len(self.data)
        for i in range(0, data_length, 2):
            key = self.data[i:i + 2]
            count_dict[key] += 1

        # print("Count dict: ")
        # print(count_dict)

        sorted_count_dict = {k: v for k, v in sorted(count_dict.items(), key=lambda item: item[1], reverse=True)}
        sorted_bits = tuple(sorted_count_dict.keys())

        embed_rule = dict(zip(sorted_bits, [
            (0, 0, 0, 0),
            (-1, 0, 1, 0),
            (0, -1, 0, 1),
            (-1, 1, 1, -1)
        ]))

        extract_rule = {
            "min": dict(zip((0, 1, -1, 2), sorted_bits)),
            "max": dict(zip((0, -1, 1, -2), sorted_bits))
        }

        return data_length, embed_rule, extract_rule

    def embed_bits(self, x1: int, x2: int, bits: str):
        sort = False
        xs1 = x1
        xs2 = x2

        if x2 < x1:
            sort = True
            xs1 = x2
            xs2 = x1

        b1b2 = bits[0:2]
        b3b4 = bits[2:4]

        min_values = self.embed_rule[b1b2]
        max_values = self.embed_rule[b3b4]
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

    def embed_data(self, image):
        img = np.int32(image)
        m, n = img.shape

        img1 = img.copy()
        img2 = img.copy()
        k = 0

        for i in range(m):
            for j in range(0, n - 1, 2):
                if k >= self.data_length:
                    break
                if 2 <= img[i, j] <= 253 and 2 <= img[i, j + 1] <= 253:
                    x11, x12, x21, x22 = self.embed_bits(
                        img[i, j],
                        img[i, j + 1],
                        self.data[k:k + 4],
                    )
                    img1[i, j] = x11
                    img1[i, j + 1] = x12
                    img2[i, j] = x21
                    img2[i, j + 1] = x22
                    k += 4

        return np.uint8(img1), np.uint8(img2)