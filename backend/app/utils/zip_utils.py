import io
import os
import zipfile
from fastapi.responses import StreamingResponse

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