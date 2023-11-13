// hooks/useDragAndDrop.js
import { useState, useEffect, useRef } from "react";

const useDragAndDrop = () => {
    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState<File[] | null>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    // Add a ref for the file input element
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Update setFiles to handle file input changes
    const handleFileInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.files) {
            const imageFiles = filterImageFiles(Array.from(event.target.files));
            setFiles(imageFiles);
        }
    };

    // const handleFileInputChange = (event) => {
    //     if (event.target.files) {
    //         const newFiles = Array.from(event.target.files);
    //         handleImageUpload(newFiles);
    //     }
    // };

    const filterImageFiles = (files: File[]): File[] => {
        return files.filter((file) => file.type.startsWith("image/"));
    };

    const handleDragOver = (e: React.DragEvent) => {
        // Check if the drag event contains files
        if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault(); // Prevent the default behavior (e.g., open file in the browser)
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length) {
            const imageFiles = filterImageFiles(Array.from(droppedFiles));
            setFiles(imageFiles);
        }
    };

    useEffect(() => {
        const mainElement = mainRef.current;

        const handleDragEnterCapture = (e: any) => {
            e.stopPropagation();
            setDragging(true);
        };

        const handleDragLeaveCapture = (e: any) => {
            if (mainElement && !mainElement.contains(e.relatedTarget)) {
                setDragging(false);
            }
        };

        if (mainElement) {
            mainElement.addEventListener(
                "dragenter",
                handleDragEnterCapture,
                true
            );
            mainElement.addEventListener(
                "dragleave",
                handleDragLeaveCapture,
                true
            );
        }

        return () => {
            if (mainElement) {
                mainElement.removeEventListener(
                    "dragenter",
                    handleDragEnterCapture,
                    true
                );
                mainElement.removeEventListener(
                    "dragleave",
                    handleDragLeaveCapture,
                    true
                );
            }
        };
    }, []);
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        const files = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file") {
                const file = items[i].getAsFile();
                if (file && file.type.startsWith("image/")) {
                    files.push(file);
                }
            }
        }
        if (files.length) {
            setFiles(files);
        }
    };
    return {
        dragging,
        files,
        handleDragOver,
        handleDrop,
        mainRef,
        setFiles,
        handlePaste,
        fileInputRef,
        triggerFileInput,
        handleFileInputChange,
    };
};

export default useDragAndDrop;
