import cv2
import numpy as np
from app.data_hiding.embedding import embed_data
from app.data_hiding.extracting import extract_data
from app.data_hiding.rule_creating import create_rule, transform_data


def display_result(image: str, data: str):
    img = cv2.imread(image, cv2.IMREAD_UNCHANGED)
    d = cv2.imread(data, cv2.IMREAD_UNCHANGED)

    td = transform_data(d)
    embed_rule, extract_rule = create_rule(td)
    print("Embedding rule: ")
    print(embed_rule)
    print("Extracting rule min: ")
    print(extract_rule.extract_rule_min)
    print("Extracting rule max: ")
    print(extract_rule.extract_rule_max)


    image1, image2 = embed_data(img, td, embed_rule)
    print("Image 1: ")
    print(image1)
    print("Image 2: ")
    print(image2)

    restored_image, extracted_data = extract_data(image1, image2, extract_rule)
    print("Restored image: ")
    print(restored_image)
    print("Restored data: ")
    print(extracted_data)

    h_image = np.hstack((img, restored_image))
    h_data = np.hstack((d, extracted_data))

    cv2.imshow("Input image and restored image", h_image)
    cv2.imshow("Input data and extracted data", h_data)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # input_img = np.array([
    #     [123, 45, 89, 200, 12, 23, 44, 231, 256],
    #     [87, 255, 0, 154, 101, 12, 23, 211, 23],
    #     [2, 88, 64, 99, 34, 232, 123, 124, 134],
    #     [220, 15, 150, 1, 203, 121, 144, 257, 123],
    #     [11, 32, 46, 78, 23, 232, 113, 114, 144]
    # ])
    # hidden_img = np.array([
    #     [1, 0, 1, 1, 0, 0, 1, 0],
    #     [0, 1, 1, 0, 1, 0, 0, 1],
    #     [1, 0, 1, 0, 0, 1, 0, 1],
    #     [1, 1, 1, 1, 0, 0, 1, 1],
    #     [1, 1, 0, 0, 1, 1, 1, 0]
    # ])

    input_img = "test_images/7.bmp"
    hidden_img = "test_images/utc_logo_460_460.bmp"
    display_result(input_img, hidden_img)
