"""Minimal PNG read/write (8-bit RGBA / RGB, non-interlaced). Standard library only."""
import struct, zlib
def read(path):
    data = open(path, "rb").read(); assert data[:8] == b"\x89PNG\r\n\x1a\n"
    pos, idat, w = 8, b"", None
    while pos < len(data):
        ln, = struct.unpack(">I", data[pos:pos+4]); typ = data[pos+4:pos+8]; body = data[pos+8:pos+8+ln]; pos += 12 + ln
        if typ == b"IHDR": w, h, bd, ct, _, _, il = struct.unpack(">IIBBBBB", body); assert bd == 8 and il == 0 and ct in (2, 6), (bd, ct, il)
        elif typ == b"IDAT": idat += body
        elif typ == b"IEND": break
    bpp = 4 if ct == 6 else 3; raw = zlib.decompress(idat); stride = w * bpp
    out = bytearray(h * stride); prev = bytearray(stride); i = 0
    for y in range(h):
        f = raw[i]; i += 1; line = bytearray(raw[i:i+stride]); i += stride
        for x in range(stride):
            a = line[x-bpp] if x >= bpp else 0; b = prev[x]; c = prev[x-bpp] if x >= bpp else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p-a), abs(p-b), abs(p-c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        out[y*stride:(y+1)*stride] = line; prev = line
    if bpp == 3:  # expand to RGBA
        rgba = bytearray(w*h*4); rgba[0::4] = out[0::3]; rgba[1::4] = out[1::3]; rgba[2::4] = out[2::3]; rgba[3::4] = b"\xff" * (w*h); out = rgba
    return w, h, out
def write(path, w, h, px):
    stride = w * 4
    raw = b"".join(b"\x00" + bytes(px[y*stride:(y+1)*stride]) for y in range(h))
    def chunk(t, b): return struct.pack(">I", len(b)) + t + b + struct.pack(">I", zlib.crc32(t + b) & 0xffffffff)
    open(path, "wb").write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
