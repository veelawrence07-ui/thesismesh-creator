import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCitationLedger } from "@/hooks/useThesisMeshData";

function truncateHash(hash: string): string {
  if (hash.length <= 14) {
    return hash;
  }

  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export default function CitationLedger() {
  const { data, isLoading } = useCitationLedger();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Citation Ledger</h2>
        <p className="text-sm text-slate-600">Immutable receipts for uploaded datasets.</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="rounded-lg border border-slate-300">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dataset Title</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Researcher</TableHead>
                <TableHead>Cryptographic Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.datasetTitle}</TableCell>
                  <TableCell>{new Date(record.dateUploaded).toLocaleDateString()}</TableCell>
                  <TableCell>{record.faculty}</TableCell>
                  <TableCell>{record.researcher}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {truncateHash(record.cryptographicReceipt)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(record.cryptographicReceipt)}
                      >
                        Copy
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
