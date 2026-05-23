import zipfile
import xml.etree.ElementTree as ET

def extract_text(pptx_path):
    with zipfile.ZipFile(pptx_path, 'r') as z, open('output.txt', 'w', encoding='utf-8') as out:
        for filename in z.namelist():
            if filename.startswith('ppt/slides/slide') and filename.endswith('.xml'):
                xml_content = z.read(filename)
                root = ET.fromstring(xml_content)
                namespaces = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
                texts = root.findall('.//a:t', namespaces)
                slide_text = [t.text for t in texts if t.text]
                if slide_text:
                    out.write(f"--- {filename} ---\n")
                    out.write("\n".join(slide_text) + "\n\n")

extract_text('SMART NADHIF DZ RF&WS.pptx')
