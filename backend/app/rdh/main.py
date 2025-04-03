import cv2
import numpy as np
from app.rdh.embedder import Embedder
from app.rdh.extractor import Extractor

def display_result(image: np.ndarray, data: np.ndarray):
    embedder = Embedder(data)
    embedder.print_rules()

    image1, image2 = embedder.embed_data(image)
    print("Image 1: ")
    print(image1)
    print("Image 2: ")
    print(image2)

    extractor = Extractor(
        image1,
        image2,
        embedder.data_length,
        embedder.extract_rule
    )
    restored_image, extracted_data = extractor.extract_data()
    print("Restored image: ")
    print(restored_image)
    print("Restored data: ")
    print(extracted_data)

    h_image = np.hstack((image, restored_image))
    h_data = np.hstack((data, extracted_data))

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

    input_img = cv2.imread("test_images/7.bmp", cv2.IMREAD_UNCHANGED)
    hidden_img = cv2.imread("test_images/utc_logo_460_460.bmp", cv2.IMREAD_UNCHANGED)
    display_result(input_img, hidden_img)
