// Local subject cut-out with Apple Vision (macOS 14+), optional black-and-white. Nothing leaves the machine.
//   swift tools/cutout.swift in.jpg out.png [bw|keep] [choke-px]
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: cutout in out.png [bw]"); exit(1) }
let input = CIImage(contentsOf: URL(fileURLWithPath: args[1]))!
let handler = VNImageRequestHandler(ciImage: input)
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { print("no subject found"); exit(2) }
print("instances:", obs.allInstances.count)
let maskBuf = try obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler)
var mask = CIImage(cvPixelBuffer: maskBuf)
// optional edge choke (pixels) to drop the halo of old background, then a soft 1 px feather
let choke = args.count > 4 ? Float(args[4]) ?? 0 : 0
if choke > 0 {
    let mn = CIFilter.morphologyMinimum(); mn.inputImage = mask; mn.radius = choke
    let bl = CIFilter.gaussianBlur(); bl.inputImage = mn.outputImage!.clampedToExtent(); bl.radius = 1.2
    mask = bl.outputImage!.cropped(to: mask.extent)
}
var img = input
if args.count > 3 && args[3] == "bw" {
    let mono = CIFilter.colorControls(); mono.inputImage = input; mono.saturation = 0; mono.contrast = 1.12; mono.brightness = 0.01
    img = mono.outputImage!
}
let blend = CIFilter.blendWithMask()
blend.inputImage = img
blend.backgroundImage = CIImage(color: .clear).cropped(to: input.extent)
blend.maskImage = mask
let out = blend.outputImage!.cropped(to: input.extent)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: args[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("wrote", args[2])
