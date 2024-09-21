import React, { useEffect, useState } from "react";
import Konva from "konva";
import FileDropArea from "./components/FileDropArea";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    setImagesLoaded,
} from "../../redux/features/slices/mainSlice";

import ResizingWindow from "./components/resizingWindow/ResizingWindow";
import Content from "./components/Content";

import ActionButtons from "./components/ActionButtons";
import { useScaleFactor } from "../../hooks/useScaleFactor";
import PageStage from "./components/PageStage";
import SettingsPanel from "./components/SettingsPanel";

import Loading from "./components/Loading";

export interface ImageBox {
    id: string;
    w: number;
    h: number;
    x: number;
    y: number;
    file?: File;
    imageElement?: HTMLImageElement;
    rotated?: boolean;
    new?: boolean;
}

const Pack = () => {
    const dispatch = useAppDispatch();

    const { inResizeMode, isPacking } = useAppSelector((state) => state.main);

    const [boxes, setBoxes] = useState<ImageBox[][]>([]);
    const [images, setImages] = useState<ImageBox[]>([]);

    const stageRefs = boxes.map(() => React.createRef<Konva.Stage>());

    useEffect(() => {
        if (!boxes || boxes.length === 0) return;

        let loadedCount = 0;
        const totalImages = images.length;

        boxes.forEach((boxSet) => {
            boxSet.forEach((box) => {
                if (!box.file) return;
                const img = new window.Image();
                img.onload = () => {
                    box.imageElement = img;
                    loadedCount++;
                    if (loadedCount === totalImages) {
                    dispatch(setImagesLoaded(true));
                    }
                };

                img.src = URL.createObjectURL(box.file);
            });
        });
    }, [boxes, images]);

    const containerWrapper = React.useRef<HTMLDivElement>(null);

    const updateScaleFactor = useScaleFactor(containerWrapper);


    return (
        <div className="flex flex-col px-2 py-10 sm:px-10">
            <Content noImagesUploaded={images.length === 0} />
            {!isPacking && boxes.length === 0 && (
                <FileDropArea
                    images={images}
                    setImages={setImages}
                />
            )}

            <SettingsPanel />

            <ActionButtons
                boxes={boxes}
                setBoxes={setBoxes}
                images={images}
                setImages={setImages}
                stageRefs={stageRefs}
                updateScaleFactor={updateScaleFactor}
            />

            {isPacking && (
                <Loading />
            )}

            {inResizeMode && images?.length > 0 && (
                <ResizingWindow setImages={setImages} images={images} />
            )}

            <div
                ref={containerWrapper}
                className="flex flex-wrap w-full items-center justify-center mx-auto   max-w-[1050px] gap-y-10 gap-x-5 "
                style={{ overscrollBehavior: "auto" }}
            >
                {boxes &&
                    boxes.map((boxSet, index) => (
                        <PageStage
                            key={index}
                            boxSet={boxSet}
                            stageRef={stageRefs}
                            index={index}
                        />
                    ))}
            </div>

            {/* dont remove */}
            <div id="temp-container" style={{ display: "none" }}></div>
        </div>
    );
};

export default Pack;
