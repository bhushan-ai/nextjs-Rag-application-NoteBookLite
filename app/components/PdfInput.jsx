import { Button } from "@/components/ui/button";
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function PdfInput({ setPdf, pdf }) {
  const fileRef = useRef();
  function handleRemovePdf() {
    setPdf(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function handlePdfFileChange(e) {
    const pFile = e.target.files?.[0];
    if (pFile) setPdf(pFile);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }
  function handleDrop(e) {
    e.preventDefault();

    const pdfFileDrop = e.dataTransfer.files?.[0];
    if (pdfFileDrop) setPdf(pdfFileDrop);
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="picture" className="font-semibold text-white">
        Upload PDF
      </Label>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className=" border-gray-400 border-2 border-dashed rounded-lg p-4"
      >
        {!pdf ? (
          <Label
            htmlFor="pdf-upload"
            className="  flex flex-col items-center h-32 cursor-pointer justify-center"
          >
            {" "}
            <Input
              type="file"
              className="hidden"
              id="pdf-upload"
              ref={fileRef}
              onChange={handlePdfFileChange}
              accept="application/pdf"
            />
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or Click to upload pdf</span>{" "}
          </Label>
        ) : (
          <div className="flex items-center justify-between ">
            <div className="flex items-center ">
              <FileIcon className="w-7 h-7 text-gray-300 mr-2" />
            </div>
            <p className="text-sm font-medium">{pdf.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleRemovePdf}
            >
              <XIcon className="w-4 h-4 " />
              <span className="sr-only">remove file</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfInput;
