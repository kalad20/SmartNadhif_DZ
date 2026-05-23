import zipfile
import os

def extract_images(pptx_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    with zipfile.ZipFile(pptx_path, 'r') as z:
        for filename in z.namelist():
            if filename.startswith('ppt/media/') and (filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg')):
                # Extract file
                z.extract(filename, output_dir)
                print(f"Extracted: {filename}")

extract_images('SMART NADHIF DZ RF&WS.pptx', 'extracted_images')
