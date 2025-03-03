import numpy as np

class ExtractRule:
    def __init__(self, data_length, extract_rule_min, extract_rule_max):
        self.data_length = data_length
        self.extract_rule_min = extract_rule_min
        self.extract_rule_max = extract_rule_max

def transform_data(data: np.ndarray):
    d = data.copy()
    m, n = d.shape
    m_bin = bin(m)[2:]
    n_bin = bin(n)[2:]
    td = ""
    for i in range(m):
        for j in range(n):
            if d[i, j] == 255:
                d[i, j] = 1
            td += str(d[i][j])

    while len(m_bin) < 10:
        m_bin = "0" + m_bin
    while len(n_bin) < 10:
        n_bin = "0" + n_bin

    return m_bin + n_bin + td

def create_rule(data: str):
    count_dict = {"00": 0, "01": 0, "10": 0, "11": 0}

    data_length = len(data)
    for i in range(0, data_length, 2):
        key = data[i:i+2]
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

    extract_rule_min = dict(zip((0, 1, -1, 2), sorted_bits))
    extract_rule_max = dict(zip((0, -1, 1, -2), sorted_bits))

    return embed_rule, ExtractRule(data_length, extract_rule_min, extract_rule_max)

def check_pixels(pixel1: int, pixel2: int):
    if 2 <= pixel1 <= 253 and 2 <= pixel2 <= 253:
        return True
    return False
