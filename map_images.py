import zipfile
import xml.etree.ElementTree as ET
import os

namespaces = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def get_mappings(pptx_path):
    with zipfile.ZipFile(pptx_path, 'r') as z:
        for filename in z.namelist():
            if filename.startswith('ppt/slides/slide') and filename.endswith('.xml'):
                rels_filename = f"ppt/slides/_rels/{os.path.basename(filename)}.rels"
                rels_map = {}
                try:
                    rels_content = z.read(rels_filename)
                    rels_root = ET.fromstring(rels_content)
                    for rel in rels_root.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
                        rels_map[rel.get('Id')] = rel.get('Target')
                except KeyError:
                    pass
                
                slide_content = z.read(filename)
                root = ET.fromstring(slide_content)
                
                texts = root.findall('.//a:t', namespaces)
                slide_text = [t.text for t in texts if t.text]
                
                blips = root.findall('.//a:blip', namespaces)
                images = []
                for blip in blips:
                    rid = blip.get(f"{{{namespaces['r']}}}embed")
                    if rid in rels_map:
                        images.append(os.path.basename(rels_map[rid]))
                
                if slide_text or images:
                    print(f"--- {filename} ---")
                    if slide_text:
                        # only print slide text if it has some team members
                        print("TEXT: " + " | ".join(slide_text))
                    if images:
                        print("IMAGES: " + ", ".join(images))
                    print()

with open("mappings.txt", "w", encoding="utf-8") as f:
    import sys
    sys.stdout = f
    get_mappings('SMART NADHIF DZ RF&WS.pptx')
