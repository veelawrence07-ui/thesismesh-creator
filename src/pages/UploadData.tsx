import { useState, useRef, type DragEvent, type FormEvent, type ChangeEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { submitDatasetToContract } from "@/services/api";
import { uploadFileToWalrus } from "@/services/walrusStorage";

export default function UploadData() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetTitle, setDatasetTitle] = useState("");
  const [facultyDiscipline, setFacultyDiscipline] = useState("");
  const [primaryResearcher, setPrimaryResearcher] = useState("");
  const [walrusBlobId, setWalrusBlobId] = useState<string | null>(null);
  const [aptosTxHash, setAptosTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitStep, setSubmitStep] = useState<"uploading" | "awaitingWallet" | null>(null);

  const { connected, account, network, signAndSubmitTransaction } = useWallet();
  const walletAddress = account?.address?.toString() ?? null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const preventDefault = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    preventDefault(event);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    setFile(droppedFile);
  };

  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!connected || !walletAddress) {
      setError("Please connect your wallet to log research data to the blockchain.");
      return;
    }

    if (!file) {
      setError("Please select or drop a dataset file before uploading.");
      return;
    }

    setWalrusBlobId(null);
    setAptosTxHash(null);
    setError(null);

    try {
      // STEP 1: Upload file to Walrus via HTTP publisher
      setSubmitStep("uploading");
      const walrusBlobId = await uploadFileToWalrus(file);

      setWalrusBlobId(walrusBlobId);
      
      // STEP 2: Sign the transaction to log metadata to Aptos
      setSubmitStep("awaitingWallet");
      const receipt = await submitDatasetToContract(
        datasetTitle,
        facultyDiscipline,
        primaryResearcher,
        walrusBlobId,
        signAndSubmitTransaction,
      );

      setAptosTxHash(receipt.hash);
      setSubmitStep(null);

      // Save to local storage for the "My Uploads" filter on Dashboard
      const storageKey = "thesismesh-wallet-uploads";
      const current = window.localStorage.getItem(storageKey);
      const parsed = current ? (JSON.parse(current) as Record<string, string[]>) : {};
      const walletUploads = parsed[walletAddress] ?? [];

      if (!walletUploads.includes(walrusBlobId)) {
        parsed[walletAddress] = [...walletUploads, walrusBlobId];
        window.localStorage.setItem(storageKey, JSON.stringify(parsed));
      }

      // Reset form
      setDatasetTitle("");
      setFacultyDiscipline("");
      setPrimaryResearcher("");
      setFile(null);
    } catch (err) {
      setSubmitStep(null);
      
      let errorMessage = "An unknown error occurred during upload.";
      
      if (err instanceof Error) {
        const lowerMsg = err.message.toLowerCase();
        if (lowerMsg.includes("user rejected") || lowerMsg.includes("rejected")) {
          errorMessage = "Transaction rejected in wallet. Please approve the signature to complete logging.";
        } else {
          errorMessage = err.message;
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Upload Data</h2>
        <p className="text-sm text-slate-600">Ingest new research datasets into Walrus Public Testnet storage.</p>
        <p className="mt-1 text-xs text-slate-500">
          Wallet: {connected && walletAddress ? walletAddress : "Disconnected"} · Network: {network?.name ?? "Unknown"}
        </p>
      </div>

      <div
        onClick={handleAreaClick}
        onDrop={onDrop}
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        className="cursor-pointer rounded-lg border border-dashed border-slate-400 bg-slate-50 p-10 text-center transition-colors hover:bg-slate-100"
      >
        <p className="text-sm text-slate-700">Drag and drop a dataset file here, or click to select</p>
        <p className="mt-2 text-xs font-medium text-slate-600">
          {file ? `Selected file: ${file.name}` : "No file selected"}
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileInputChange}
          className="hidden"
        />
      </div>

      {!connected && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertTitle className="text-amber-800">Wallet required</AlertTitle>
          <AlertDescription className="text-amber-700">
            Please connect your wallet to log research data to the blockchain.
          </AlertDescription>
        </Alert>
      )}

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
          className="bg-indigo-600 hover:bg-indigo-700 w-full"
          disabled={!connected || submitStep !== null}
        >
          {submitStep === "uploading"
            ? "Uploading to Walrus..."
            : submitStep === "awaitingWallet"
            ? "Awaiting Wallet Signature..."
            : "Upload to Walrus Network"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {walrusBlobId && aptosTxHash && (
        <Alert className="border-indigo-300 bg-indigo-50">
          <AlertTitle className="text-indigo-800">Upload successful</AlertTitle>
          <AlertDescription className="text-indigo-700">
            Walrus Blob ID: <span className="font-mono text-xs block mb-1">{walrusBlobId}</span>
            Metadata confirmed on Aptos: <span className="font-mono text-xs">{aptosTxHash}</span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
