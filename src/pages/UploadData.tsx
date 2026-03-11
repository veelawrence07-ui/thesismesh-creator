import { useState, type DragEvent, type FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDatasetUpload } from "@/hooks/useThesisMeshData";

export default function UploadData() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetTitle, setDatasetTitle] = useState("");
  const [facultyDiscipline, setFacultyDiscipline] = useState("");
  const [primaryResearcher, setPrimaryResearcher] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const uploadMutation = useDatasetUpload();

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    setFile(droppedFile);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTxHash(null);

    const response = await uploadMutation.mutateAsync({
      datasetTitle,
      facultyDiscipline,
      primaryResearcher,
      file,
    });

    setTxHash(response.transactionHash);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Upload Data</h2>
        <p className="text-sm text-slate-600">Ingest new research datasets into the Shelby Network.</p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        className="rounded-lg border border-dashed border-slate-400 bg-slate-50 p-10 text-center"
      >
        <p className="text-sm text-slate-700">Drag and drop a dataset file here</p>
        <p className="mt-2 text-xs text-slate-500">
          {file ? `Selected file: ${file.name}` : "No file selected"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="datasetTitle">Dataset Title</Label>
          <Input
            id="datasetTitle"
            value={datasetTitle}
            onChange={(event) => setDatasetTitle(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="faculty">Faculty/Discipline</Label>
          <Input
            id="faculty"
            value={facultyDiscipline}
            onChange={(event) => setFacultyDiscipline(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="researcher">Primary Researcher</Label>
          <Input
            id="researcher"
            value={primaryResearcher}
            onChange={(event) => setPrimaryResearcher(event.target.value)}
            required
          />
        </div>

        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? "Uploading..." : "Upload to Shelby Network"}
        </Button>
      </form>

      {txHash && (
        <Alert className="border-indigo-300">
          <AlertTitle>Upload successful</AlertTitle>
          <AlertDescription>Aptos transaction hash: {txHash}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
