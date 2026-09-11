import os
import snappy
import sys

appdata = os.environ.get('APPDATA')
ls_path = os.path.join(appdata, 'react-example', 'Local Storage', 'leveldb')

all_data = b""
for f in os.listdir(ls_path):
    if f.endswith('.ldb'): # only check ldb files, log files might not have block compression
        with open(os.path.join(ls_path, f), 'rb') as file:
            data = file.read()
            if b"3derp_printJobs" in data:
                print(f"Found in {f}")
                pos = data.find(b"3derp_printJobs")
                # Try all block starts before this position
                for start in range(max(0, pos - 4096), pos + 1):
                    for length in range(100, min(8192, len(data) - start)):
                        try:
                            chunk = data[start:start+length]
                            uncompressed = snappy.uncompress(chunk)
                            if b"3derp_printJobs" in uncompressed and b"[{" in uncompressed:
                                print(f"Success at start {start}, length {length}")
                                with open('extracted_prints_raw.bin', 'wb') as out:
                                    out.write(uncompressed)
                                
                                # strip non-printable
                                clean_str = uncompressed.decode('utf-16le', errors='ignore')
                                import re
                                clean_str = re.sub(r'[\x00-\x1F\x7F]', '', clean_str)
                                with open('extracted_prints_clean.txt', 'w', encoding='utf-8') as out_txt:
                                    out_txt.write(clean_str)
                                
                                print("Wrote output files.")
                                sys.exit(0)
                        except Exception as e:
                            pass
                print("Failed to decompress block in this file")
