import jsPDF from "jspdf";
// import { Box } from "./ImagePacker";
import Konva from "konva";
import { v4 as uuidv4 } from "uuid";

import { ContainerType, ImageBox } from "./Home";
import { ImageData } from "./components/resizingWindow/ResizingWindow";
import { pack } from "efficient-rect-packer";
export const handleSaveAsPDF = ({
    boxes,
    container,
}: {
    boxes: ImageBox[][];
    container: ContainerType;
}) => {
    const pdf = new jsPDF("p", "pt", "a4");
    pdf.setTextColor("#000000");

    const a4Width = 595; // A4 width in points
    const a4Height = 842; // A4 height in points

    const scaleX = a4Width / container.w;
    const scaleY = a4Height / container.h;

    boxes.forEach((boxSet, index) => {
        if (index > 0) {
            pdf.addPage("a4", "portrait");
        }

        const stage = new Konva.Stage({
            container: "temp-container",
            width: container.w,
            height: container.h,
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        boxSet.forEach((box) => {
            if (box.imageElement) {
                const konvaImage = new Konva.Image({
                    x: box.x,
                    y: box.y,
                    width: box.rotated ? box.h : box.w,
                    height: box.rotated ? box.w : box.h,
                    image: box.imageElement,
                    rotation: box.rotated ? -90 : 0,
                    offsetX: box.rotated ? box.h : 0,
                });
                layer.add(konvaImage);
            }

            const rect = new Konva.Rect({
                x: box.x,
                y: box.y,
                width: box.w,
                height: box.h,
                stroke: "red",
            });
            layer.add(rect);
        });

        pdf.addImage(
            stage.toDataURL({ pixelRatio: 2 }),
            0,
            0,
            container.w * scaleX,
            container.h * scaleY
        );

        stage.destroy();
    });

    pdf.save("packed-images.pdf");
};

export const handlePrintMultipleStages = (stages: (Konva.Stage | null)[]) => {
    let imagesContent = "";

    stages.forEach((stage) => {
        if (!stage) {
            return;
        }
        const dataUrl = stage.toDataURL();
        // imagesContent += `<img class="print-page" src="${dataUrl}">`;

        imagesContent += `<img class="print-page" src="${dataUrl}" style="page-break-after: always; width: 100%; height: auto; display: block; margin: 0 !important; padding: 0 !important;">`;
    });

    const iframeContent = `
            <html>
                <head>
                    <title>Print canvas</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        .print-page {
                            page-break-after: always;
                            width: 100%;
                            height: auto;
                            display: block;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                        }
                    </style>
                </head>
                <body style="margin: 0 !important; padding: 0 !important;">
                    ${imagesContent}
                </body>
            </html>`;

    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.style.display = "none";
    console.log("loading iframe");

    iframe.onload = function () {
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(iframeContent);
            doc.close();
            console.log("iframe content written");

            setTimeout(() => {
                console.log("printing iframe content");

                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            }, 1000); // Give it half a second to load the images
        }
    };
};

// function to create the images from files
export const createImages = async (files: File[]) => {
    // const files = Array.from(fileList);
    const newImages: ImageBox[] = await Promise.all(
        files.map((file) => {
            return new Promise<ImageBox>((resolve) => {
                const img = new Image();
                const id = uuidv4();
                img.onload = () => {
                    resolve({
                        id,
                        w: img.width,
                        h: img.height,
                        x: 0,
                        y: 0,
                        file,
                    });
                };
                img.src = URL.createObjectURL(file);
            });
        })
    );

    return newImages;
};

// function to pack the images into the container
export const packBoxes = async ({
    images,
    container,
}: {
    images: ImageBox[];
    container: ContainerType;
}) => {
    let remainingImages = [...images]; // Copy the images array to manipulate
    const allPackedBoxes: ImageBox[][] = [];

    while (remainingImages.length > 0) {
        const { packed_rectangles, unpacked_rectangles, error } = await pack(
            remainingImages,
            {
                w: container.w,
                h: container.h,
            },
            {
                padding: container.padding,
                margin: container.margin,
                noRotation: false,
            }
        );

        if (error && error.length > 0) {
            console.error("Packing error:", error);
            break;
        }

        allPackedBoxes.push(packed_rectangles);
        remainingImages = unpacked_rectangles;
    }

    return allPackedBoxes;
};
