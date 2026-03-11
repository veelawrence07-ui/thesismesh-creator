import { useState, type DragEvent, type FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDatasetUpload } from "@/hooks/useThesisMeshData";
import { submitDatasetToContract } from "@/services/api";

export default function UploadData() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetTitle, setDatasetTitle] = useState("");
  const [facultyDiscipline, setFacultyDiscipline] = useState("");
  const [primaryResearcher, setPrimaryResearcher] = useState("");
  const [shelbyTxHash, setShelbyTxHash] = useState<string | null>(null);
  const [aptosTxHash, setAptosTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitStep, setSubmitStep] = useState<"uploading" | "awaitingWallet" | null>(null);

  const uploadMutation = useDatasetUpload();

  const preventDefault = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    preventDefault(event);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    setFile(droppedFile);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShelbyTxHash(null);
    setAptosTxHash(null);
    setError(null);
    setSubmitStep("uploading");

    if (!file) {
      setError("Please select or drop a dataset file before uploading.");
      setSubmitStep(null);
      return;
    }

    try {
      const response = await uploadMutation.mutateAsync({
        datasetTitle,
        facultyDiscipline,
        primaryResearcher,
        file,
      });

      setShelbyTxHash(response.transactionHash);
      setSubmitStep("awaitingWallet");

      const receipt = await submitDatasetToContract(
        datasetTitle,
        facultyDiscipline,
        primaryResearcher,
        response.transactionHash,
      );

      setAptosTxHash(receipt.hash);
      setSubmitStep(null);

      // Clear form on success
      setDatasetTitle("");
      setFacultyDiscipline("");
      setPrimaryResearcher("");
      setFile(null);
    } catch (err) {
      setSubmitStep(null);

      if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (message.includes("user rejected") || message.includes("rejected")) {
          setError("Transaction rejected in Petra wallet. Please approve the signature to complete logging.");
          return;
        }

        setError(err.message);
        return;
      }

      setError("An unknown error occurred during upload.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Upload Data</h2>
        <p className="text-sm text-slate-600">Ingest new research datasets into the Shelby Network.</p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        className="rounded-lg border border-dashed border-slate-400 bg-slate-50 p-10 text-center cursor-pointer hover:bg-slate-100 transition-colors"
      >
        <p className="text-sm text-slate-700">Drag and drop a dataset file here</p>
        <p className="mt-2 text-xs font-medium text-slate-600">
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

        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={uploadMutation.isPending || submitStep === "awaitingWallet"}
        >
          {submitStep === "uploading"
            ? "Uploading to Shelby..."
            : submitStep === "awaitingWallet"
              ? "Awaiting Wallet Signature..."
              : "Upload to Shelby Network"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {shelbyTxHash && aptosTxHash && (
        <Alert className="border-indigo-300 bg-indigo-50">
          <AlertTitle className="text-indigo-800">Upload successful</AlertTitle>
          <AlertDescription className="text-indigo-700">
            Metadata confirmed on Shelbynet: <span className="font-mono text-xs">{aptosTxHash}</span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
