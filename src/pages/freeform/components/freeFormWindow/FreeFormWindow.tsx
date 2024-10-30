import PageEndIndicators from "@/components/PageEndIndicators";
import PageWidthIndicator from "@/components/PageWidthIndicator";
import useFreeForm from "@/hooks/useFreeForm";
import MarginHandles from "@/pages/pack/components/resizingWindow/components/MarginHandles";
import MarginInputs from "@/pages/pack/components/resizingWindow/components/MarginInputs";
import Options from "@/pages/pack/components/resizingWindow/components/Options";
import ResizeAnchor from "@/pages/pack/components/resizingWindow/components/ResizeAnchor";
import ResizeWindowSettings from "@/pages/pack/components/resizingWindow/components/ResizeWindowSettings";
import { ImageBox } from "@/pages/pack/Pack";
import { useAppSelector } from "@/redux/hooks";
import React, { useState } from "react";


interface Props {
    images: ImageBox[];
    setImages: React.Dispatch<React.SetStateAction<ImageBox[]>>;
}

const FreeFormWindow: React.FC<Props> = ({ images, setImages }) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [showMarginControls, setShowMarginControls] = useState(false);
    const { container, showBorder } = useAppSelector((state) => state.main);
    const { localImages, imageUrls, handleMouseDown, selectedId, maxY, setLocalImages, setMaxY, setImageToPresetSize } = useFreeForm({
        containerRef,
        images,
        setImages,
    });



    return (
        <div className="flex flex-col items-center justify-center w-full pt-5 border-t">
            <div className="mb-4">
                <p className="text-sm text-center text-gray-600">
                    Click on the image and use the resize handle to resize the
                    images. Take reference from the A4 paper width below and
                    decide what size you want each image to be.
                </p>
            </div>

            <ResizeWindowSettings
                showMarginControls={showMarginControls}
                setShowMarginControls={setShowMarginControls}
                freeform
            />
            {/* {showMarginControls && <MarginInputs localImages={localImages} setLocalImages={setLocalImages} setMaxY={setMaxY} />} */}

            <div
                ref={containerRef}
                style={{
                    width: container.w * container.scaleFactor,
                    height: (maxY + 5) * container.scaleFactor,
                    border: "1px solid black",
                    position: "relative",
                }}
                className="mt-10 bg-white shadow-xl"
            >
                <PageWidthIndicator />


                {/* {showMarginControls && (
                    <MarginHandles
                        localImages={localImages}
                        setLocalImages={setLocalImages}
                        setMaxY={setMaxY}
                        containerRef={containerRef}
                    />

                )} */}

                <PageEndIndicators maxY={maxY} localImages={localImages} />
                {localImages.map((imgData) => {
                    const imageUrl = imageUrls.get(imgData.id) || "";

                    return (
                        <div
                            key={imgData.id}
                            data-id={imgData.id}
                            style={{
                                position: "absolute",
                                left: imgData.x * container.scaleFactor,
                                top: imgData.y * container.scaleFactor,
                                width: imgData.w * container.scaleFactor,
                                height: imgData.h * container.scaleFactor,
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: "cover",
                                border:
                                    selectedId === imgData.id
                                        ? "2px solid blue"
                                        : showBorder
                                            ? "1px solid black"
                                            : "none",
                                zIndex: selectedId === imgData.id ? 1 : 0,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, imgData)}
                            onTouchStart={(e) => handleMouseDown(e, imgData)}

                        >
                            {selectedId === imgData.id && <Options id={imgData.id} images={images} setImages={setImages} imageUrl={imageUrl} setImageToPresetSize={setImageToPresetSize} />}
                            {selectedId === imgData.id && <ResizeAnchor />}
                        </div>
                    );
                })}
            </div>


        </div>
    );
};

export default FreeFormWindow;
